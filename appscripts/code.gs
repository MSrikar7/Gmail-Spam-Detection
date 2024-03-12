// Google Apps Script Code

function setupTimeTrigger() {
  // Delete existing triggers to avoid duplicates (optional)
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    ScriptApp.deleteTrigger(triggers[i]);
  }

  // Set up a time-driven trigger to run classifyEmails every 5 minutes
  ScriptApp.newTrigger('classifyEmails')
    .timeBased()
    .everyMinutes(1)
    .create();
}

function classifyEmails() {
  var threads = GmailApp.getInboxThreads();
  var apiUrl = "http://13.232.12.217:5000/classify";  // Update with your Flask API URL

  // Check if labels exist, create them if not
  ensureLabelsExist();

  // Classify non-labeled existing emails
  threads.forEach(function(thread) {
    var messages = thread.getMessages();
    
    messages.forEach(function(message) {
      var labels = message.getThread().getLabels();
      if (!labels.some(label => label.getName() === "spamm" || label.getName() === "ham")) {
        var body = message.getPlainBody();
        var classification = classifyWithModel(body, apiUrl);

        // Assuming you have labels named "spamm" and "ham"
        if (classification === 0) {
          message.getThread().addLabel(GmailApp.getUserLabelByName("spamm"));
        } else if (classification === 1) {
          message.getThread().addLabel(GmailApp.getUserLabelByName("ham"));
        }
      }
    });
  });

  // Classify non-labeled new emails
  var newThreads = GmailApp.getInboxThreads(0, 1); // Get the most recent thread
  if (newThreads.length > 0) {
    var newMessages = newThreads[0].getMessages();
    newMessages.forEach(function(message) {
      var labels = message.getThread().getLabels();
      if (!labels.some(label => label.getName() === "spamm" || label.getName() === "ham")) {
        var body = message.getPlainBody();
        var classification = classifyWithModel(body, apiUrl);

        // Assuming you have labels named "spamm" and "ham"
        if (classification === 0) {
          message.getThread().addLabel(GmailApp.getUserLabelByName("spamm"));
        } else if (classification === 1) {
          message.getThread().addLabel(GmailApp.getUserLabelByName("ham"));
        }
      }
    });
  }
}

function ensureLabelsExist() {
  // Check if "spamm" label exists, create if not
  createLabelIfNotExists("spamm");

  // Check if "ham" label exists, create if not
  createLabelIfNotExists("ham");
}

function createLabelIfNotExists(labelName) {
  var labels = GmailApp.getUserLabels();

  // Check if the label already exists
  for (var i = 0; i < labels.length; i++) {
    if (labels[i].getName() === labelName) {
      return; // Label already exists, no need to create
    }
  }

  // Label does not exist, create it
  GmailApp.createLabel(labelName);
}

function classifyWithModel(text, apiUrl) {
  try {
    var payload = {
      'text': text
    };

    var options = {
      'method': 'post',
      'contentType': 'application/json',
      'payload': JSON.stringify(payload)
    };

    var response = UrlFetchApp.fetch(apiUrl, options);
    var result = JSON.parse(response.getContentText());

    // Log the entire response for debugging
    Logger.log('Full Response: ' + JSON.stringify(result));

    // Extract the classification value
    var classification = result.classification;

    // Log the extracted classification value
    Logger.log('Extracted Classification: ' + classification);

    return classification;
  } catch (error) {
    Logger.log('Error: ' + error.toString());
    return 'error';
  }
}

