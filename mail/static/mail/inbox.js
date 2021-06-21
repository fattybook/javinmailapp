document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector("#submit").addEventListener('click', send_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email-view').innerHTML = "";

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').innerHTML = "";

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Load the mailbox
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    // Print emails
    console.log(emails);

    // ... do something else with emails ...
    emails.forEach(load_email);
});
}

function load_email(contents) {
    // Create new post
  console.log(contents);
  const post = document.createElement('div');
  post.className = 'post';
  post.id = contents.id
  post.innerHTML = `<div class="row" style="border:black; border-width:2px; border-style:solid;"> <b class="col" >${contents.sender}</button> ${contents.subject} <div class="col" style="text-align:right;"> ${contents.timestamp}</div> </div>`;
  post.addEventListener('click', function () {
    view_email(contents)
  });
  console.log(post);
  if (contents.read) {
    post.style.backgroundColor = "gray"
  } else {
    post.style.backgroundColor = "white"
  }

  // Add post to DOM
  document.querySelector('#emails-view').append(post);
};

function view_email(contents) {
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').innerHTML = "";
  fetch(`/emails/${contents.id}`)
  .then(response => response.json())
  .then(email => {
    // Print email
    console.log(email);
    if (email.archived) {
      archive = "Unarchive"
    } else {
      archive = "Archive"
    }
    const from = document.createElement("div");
    const to = document.createElement("div");
    const subject = document.createElement("div");
    const timestamp = document.createElement("div");
    const reply_button = document.createElement("button");
    const archive_button = document.createElement("button");
    const body = document.createElement("div");
  
    from.innerHTML = `<strong>From: </strong> ${email["sender"]}`;
    to.innerHTML = `<strong>To: </strong> ${email["recipients"]}`;
    subject.innerHTML = `<strong>Subject: </strong> ${email["subject"]}`;
    timestamp.innerHTML = `<strong>Timestamp: </strong> ${email["timestamp"]}`;
    body.innerHTML = email["body"];

    archive_button.classList = "btn btn-outline-primary m-2";
    archive_button.addEventListener('click', function () {
      archive_email(email)
      load_mailbox('inbox')
    });
  
    
    // * Reply button
    reply_button.innerHTML = '<svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-reply-fill" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M9.079 11.9l4.568-3.281a.719.719 0 0 0 0-1.238L9.079 4.1A.716.716 0 0 0 8 4.719V6c-1.5 0-6 0-7 8 2.5-4.5 7-4 7-4v1.281c0 .56.606.898 1.079.62z"/></svg>  Reply';
    reply_button.classList = "btn btn-outline-primary m-2";
    reply_button.addEventListener("click", () => compose_reply(email));
  
    document.querySelector("#email-view").appendChild(from);
    document.querySelector("#email-view").appendChild(to);
    document.querySelector("#email-view").appendChild(subject);
    document.querySelector("#email-view").appendChild(timestamp);
    document.querySelector("#email-view").appendChild(archive_button);
    document.querySelector("#email-view").appendChild(reply_button);
    document.querySelector("#email-view").appendChild(document.createElement("hr"));
    document.querySelector("#email-view").appendChild(body);
  });
    // ... do something else with email ...
    fetch(`/emails/${contents.id}`, {
      method: 'PUT',
      body: JSON.stringify({
          read: true
      })
    })
  }

function send_email() {

  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: document.querySelector('#compose-receipients').value,
        subject: document.querySelector('#compose-subject').value,
        body: document.querySelector('#compose-body').value,
    })
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      console.log(result);
  });
  load_mailbox('inbox')
}

function archive_email(email) {
  fetch(`/emails/${email.id}`, {
    method: 'PUT',
    body: JSON.stringify({
        archived: !email.archived
    })
  })
  console.log(email.archived)
}

function compose_reply(email) {
    // Show compose view and hide other views
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'block';
    document.querySelector('#email-view').innerHTML = "";

    //Pre-fill recipient form
    document.querySelector('#compose-recipients').value = email.sender;
    document.querySelector('#compose-subject').value = `Re: ${email.subject}`;
    document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote: ${email.body}`;
}