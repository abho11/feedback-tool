// User functionality

// submit feedback form

document.getElementById('feedbackForm').addEventListener('submit', function (event) {
    event.preventDefault();

    var formData = new FormData(this);

    fetch(this.action, {
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {

                this.reset();

                window.location.href = 'index.html?success=true';
            } else {

                window.location.href = 'index.html?success=false';
            }
        })
        .catch(error => {
            console.error('Error submitting form:', error);
            window.location.href = 'index.html?success=false';
        });
});


window.onload = function () {
    const params = new URLSearchParams(window.location.search);
    if (params.has('success')) {
        if (params.get('success') === 'true') {
            alert('Form submitted successfully.');
            window.location.href = 'index.html';
        } else {
            alert('Failed to submit form.');
        }
    }
};


//function to check ticket details

function checkTicketStatus() {
    var ticketNumber = document.getElementById('ticketNumber').value.trim();

    if (ticketNumber === '') {
        alert('Please enter a ticket number.');
        return;
    }

    fetch('src/php/get_ticket_status.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'ticketNumber=' + encodeURIComponent(ticketNumber)
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                updateContainerContent(data.ticket, ticketNumber);
                document.getElementById('ticketDetailsContainer').style.display = 'block';
            } else {
                alert(data.message);
                document.getElementById('ticketDetailsContainer').style.display = 'none';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Failed to retrieve ticket status.');
            document.getElementById('ticketDetailsContainer').style.display = 'none';
        });
}

// function to format date in mm/dd/yyyy

function formatDate(dateString) {
    const date = new Date(dateString);
    let month = '' + (date.getMonth() + 1),
        day = '' + date.getDate(),
        year = date.getFullYear();

    if (month.length < 2)
        month = '0' + month;
    if (day.length < 2)
        day = '0' + day;

    return [month, day, year].join('/');
}

// function to display and update the ticket content 

function updateContainerContent(ticket, ticketNumber) {
    let commentsHTML = '<p>No comments yet.</p>';
    try {
        const comments = JSON.parse(ticket.comments || '[]');
        commentsHTML = comments.map(comment => {

            const commentDate = new Date(comment.timestamp + 'Z');
            const formattedDate = commentDate.toLocaleString('en-US', {
                timeZone: 'America/Denver',
                year: 'numeric', month: 'numeric', day: 'numeric',
                hour: '2-digit', minute: '2-digit', second: '2-digit'
            });

            return `
            <div class="${comment.author === 'Admin' ? 'admin-comment' : 'user-comment'}">
                <span class="${comment.author === 'Admin' ? 'admin-name' : 'user-name'}">${comment.author}:</span>
                <p>${comment.text}</p>
                <small style="color: #666; font-style: italic;">${formattedDate}</small> 
            </div>`;
        }).join('');
    } catch (e) {
        console.error('Error parsing comments:', e);
        commentsHTML = '<p>Error displaying comments.</p>';
    }

    let inputAreaHTML = '';
    if (ticket.status !== 'Closed') {
        inputAreaHTML = `
            <textarea class="gls-textarea" id="newComment" placeholder="Add a comment..."></textarea>
            <div style="text-align:right">
            <button class="gls-button gls-button-primary" onclick="updateComment('${ticketNumber}')" style="margin-top: 30px;">Add Comment</button></div>
        `;
    } else {
        inputAreaHTML = '<br><p style="text-align:center;"><i>This ticket has been closed and can no longer be commented on.</i></p>';
    }

    const detailsHTML = `
        <p>Date Created: ${formatDate(ticket.created_at)}
        <p>Name: ${ticket.name}</p>
        <p>Email: ${ticket.email}</p>
        <p>Issue Type: ${ticket.issue_type}</p>
        <p>User Type: ${ticket.user_type}</p>
        <p>Description: ${ticket.description}</p>
        <p>Status: ${ticket.status}</p>
        <div class="comments-container"><p style="margin-top: 20px; margin-bottom:35px; text-align:center"><i>Comments</i></p>${commentsHTML}</div><br>
        ${inputAreaHTML}
    `;
    document.getElementById('ticketDetails').innerHTML = detailsHTML;
}


// function to update user comments

function updateComment(ticketNumber) {
    var newComment = document.getElementById('newComment').value;
    if (!newComment.trim()) {
        alert('Please enter a comment.');
        return;
    }

    fetch('src/php/update_comments.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'ticketNumber=' + encodeURIComponent(ticketNumber) + '&comment=' + encodeURIComponent(newComment)
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Comment updated successfully.');

                checkTicketStatus();
            } else {
                alert('Failed to update comment: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error updating comment:', error);
            alert('Failed to update comment.');
        });
}


document.getElementById('showDetailsButton').addEventListener('click', function () {
    var detailsDiv = document.getElementById('ticketDetails');
    if (detailsDiv.style.display === 'none') {
        detailsDiv.style.display = 'block';
    } else {
        detailsDiv.style.display = 'none';
    }
});
