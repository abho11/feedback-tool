// Administrator functionality


// on load parameters

document.addEventListener('DOMContentLoaded', function () {
    setupEventListeners();
    fetchTickets();
});

function setupEventListeners() {
    const searchInput = document.getElementById('searchQuery');
    const searchButton = document.getElementById('searchButton');

    if (searchInput) {
        searchInput.addEventListener('keypress', function (event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                fetchTickets(1);
                window.location.hash = 'results';
            }
        });
    }

    if (searchButton) {
        searchButton.addEventListener('click', function () {
            fetchTickets(1);
        });
    }

    //  changes for filters and sorting
    ['filterByIssueType', 'filterByUserType', 'filterByStatus', 'sortBy', 'perPageSelect'].forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('change', function () {
                fetchTickets(1);
            });
        }
    });
}


document.addEventListener('DOMContentLoaded', function () {
    fetchInitialTicketCounts();

    const searchButton = document.getElementById('searchButton');
    searchButton.addEventListener('click', function () {
        fetchTickets();
    });

    document.getElementById('filterByIssueType').addEventListener('change', fetchTickets);
    document.getElementById('filterByUserType').addEventListener('change', fetchTickets);
    document.getElementById('filterByStatus').addEventListener('change', fetchTickets);
    document.getElementById('sortBy').addEventListener('change', fetchTickets);

    const displayAllButton = document.querySelector('.gls-button-default');
    displayAllButton.addEventListener('click', function () {
        fetchAllTickets();
    });
});

// function to fetch 1st page tickets

function fetchTickets(page = 1) {
    const query = document.getElementById('searchQuery').value.trim();
    const issueType = document.getElementById('filterByIssueType').value;
    const userType = document.getElementById('filterByUserType').value;
    const status = document.getElementById('filterByStatus').value;
    const sortBy = document.getElementById('sortBy').value;
    const perPage = document.getElementById('perPageSelect').value;

    //  query parameters are encoded
    const params = new URLSearchParams({
        page, perPage, searchQuery: query, issueType, userType, status, sortBy
    });

    const url = `src/php/search_tickets.php?${params.toString()}`;

    fetch(url, { method: 'GET' })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                displayTickets(data.tickets, data.currentPage, data.totalPages);

            } else {
                document.getElementById('results').innerHTML = '<p>No tickets found.</p>';
            }
        })
        .catch(error => {
            console.error('Error fetching tickets:', error);
            document.getElementById('results').innerHTML = '<p>Error loading tickets.</p>';
        });
}


//  tickets and manage pagination
function displayTickets(tickets, currentPage, totalPages) {
    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = '';
    resultsContainer.appendChild(createResultsTable(tickets));
    updatePagination(currentPage, totalPages);
}

function updatePagination(currentPage, totalPages) {
    const paginationContainer = document.getElementById('pagination');
    paginationContainer.innerHTML = '';

    if (totalPages <= 1) return;

    const ul = document.createElement('ul');
    ul.className = 'gls-pagination gls-flex-center';

    //  pagination items
    appendPaginationItem(ul, '«', currentPage > 1 ? currentPage - 1 : null);
    for (let i = 1; i <= totalPages; i++) {
        appendPaginationItem(ul, i, i !== currentPage ? i : null, i === currentPage);
    }
    appendPaginationItem(ul, '»', currentPage < totalPages ? currentPage + 1 : null);

    paginationContainer.appendChild(ul);
}

// pagination controls
function createPagination(container, currentPage, totalPages) {
    const ul = document.createElement('ul');
    ul.className = 'gls-pagination gls-flex-center';

    //  pagination items
    appendPaginationItem(ul, '«', currentPage > 1 ? currentPage - 1 : null);
    for (let i = 1; i <= totalPages; i++) {
        appendPaginationItem(ul, i, i !== currentPage ? i : null, i === currentPage);
    }
    appendPaginationItem(ul, '»', currentPage < totalPages ? currentPage + 1 : null);

    container.appendChild(ul);
}

// Append pagination items
function appendPaginationItem(ul, text, page, isActive = false) {
    const li = document.createElement('li');
    if (isActive) {
        li.classList.add('gls-active');
        li.innerHTML = `<span>${text}</span>`;
    } else if (page !== null) {
        li.innerHTML = `<a href="#" onclick="fetchTickets(${page}); return false;">${text}</a>`;
    } else {
        li.classList.add('gls-disabled');
        li.innerHTML = `<span>${text}</span>`;
    }
    ul.appendChild(li);
}

// function to fetch all tickets

function fetchAllTickets() {
    fetch('src/php/fetch_all_tickets.php', {
        method: 'GET'
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                displayTickets(data.tickets);
            } else {
                document.getElementById('results').innerHTML = '<p>No tickets to display.</p>';
            }
        })
        .catch(error => {
            console.error('Fetch All Error:', error);
            document.getElementById('results').innerHTML = '<p>Failed to load all tickets.</p>';
        });
}

// function to create result table

function createResultsTable(tickets) {
    const table = document.createElement('table');
    table.className = 'gls-table gls-table-striped gls-table-divider gls-table-hover';

    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    ['No.', 'Ticket Number', 'Date Created', 'Name', 'Email', 'Issue Type', 'User Type', 'Status'].forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);


    const tbody = document.createElement('tbody');
    tickets.forEach((ticket, index) => {
        const tr = document.createElement('tr');
        tr.style.cursor = 'pointer';
        tr.onclick = () => openTicketDetailsModal(ticket);


        const tdIndex = document.createElement('td');
        tdIndex.textContent = index + 1;
        tr.appendChild(tdIndex);
        ['ticket_number', 'created_at', 'name', 'email', 'issue_type', 'user_type', 'status'].forEach(key => {
            const td = document.createElement('td');
            td.textContent = ticket[key];
            if (key === 'created_at') {
                td.textContent = formatDate(ticket[key]);
            } else {
                td.textContent = ticket[key];
            }
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    return table;
}

// function to open ticket modal

function openTicketDetailsModal(ticket) {
    const modal = document.getElementById('ticketDetailsModal');
    const details = document.getElementById('ticketDetails');

    if (!modal || !details) {
        console.error('Modal or details elements not found');
        return;
    }

    let commentsDisplay = '<p>No comments yet.</p>';

    let comments = ticket.comments;
    if (typeof comments === 'string') {
        try {
            comments = JSON.parse(comments);
        } catch (e) {
            console.error('Error parsing comments:', e);
            comments = [];
        }
    }

    if (Array.isArray(comments) && comments.length > 0) {
        commentsDisplay = '<ul class="gls-list gls-list-striped">';
        comments.forEach(comment => {
            const formattedTime = formatMDTDate(comment.timestamp);
            commentsDisplay += `<li>${comment.author} (${formattedTime}): ${comment.text}</li>`;
        });
        commentsDisplay += '</ul>';
    }

    let actionElements = '';
    if (ticket.status === "Closed") {
        actionElements = `<br><p style="text-align:center;"><i>This ticket has been closed.</i></p>`;
    } else {
        actionElements = `
            <textarea style="margin-bottom: 20px;" id="comment" class="gls-textarea" placeholder="Add a comment..."></textarea>
            <button style="margin-right: 20px;" onclick="updateComment('${ticket.ticket_number}')" class="gls-button gls-button-primary">Add Comment</button>
            <button onclick="closeTicket('${ticket.ticket_number}')" class="gls-button gls-button-danger">Close Ticket</button>
        `;
    }

    details.innerHTML = `
        <h3> ${ticket.ticket_number} - ${ticket.status}</h3>
        <p>Description: <br> ${ticket.description}</p>
        ${commentsDisplay}
        ${actionElements}
    `;
    modal.style.display = 'block';
}

// function to add and update admin comments

function updateComment(ticketNumber) {
    var comment = document.getElementById('comment').value.trim();
    if (comment === '') {
        alert('Please enter a comment.');
        return;
    }

    fetch('src/php/update_admin_comment.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `ticketNumber=${encodeURIComponent(ticketNumber)}&comment=${encodeURIComponent(comment)}`
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Comment added successfully.');
                openTicketDetailsModal({ ticket_number: ticketNumber, status: 'Open', description: '', comments: data.comments });
                fetchTickets();
            } else {
                alert('Failed to add comment: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error adding comment:', error);
            alert('Failed to add comment.');
        });
}

// function to close tickets

function closeTicket(ticketNumber) {
    if (!confirm('Are you sure you want to close this ticket?')) return;

    fetch('src/php/close_ticket.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `ticketNumber=${encodeURIComponent(ticketNumber)}`
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Ticket closed successfully.');
                document.location.reload(true); // Refresh the page to reflect the changes
            } else {
                alert('Failed to close ticket: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error closing ticket:', error);
            alert('Failed to close ticket.');
        });
}

// function to convert time zone to MDT

function formatMDTDate(dateString) {
    const date = new Date(dateString + 'Z');
    return date.toLocaleString('en-US', { timeZone: 'America/Denver' });
}

function formatDate(isoString) {
    const date = new Date(isoString);
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
}


// function to fetch ticket count

function fetchInitialTicketCounts() {
    fetch('src/php/fetch_ticket_counts.php')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                updateTicketCountsDisplay(data.total, data.open, data.closed);
            }
        })
        .catch(error => console.error('Failed to fetch ticket counts:', error));
}

function updateTicketCountsDisplay(total, open, closed) {
    document.getElementById('totalTickets').textContent = `Total Tickets: ${total}`;
    document.getElementById('openTickets').textContent = `Open Tickets: ${open}`;
    document.getElementById('closedTickets').textContent = `Closed Tickets: ${closed}`;
}

function incrementTicketCount() {
    let total = parseInt(document.getElementById('totalTickets').textContent.split(": ")[1]);
    let open = parseInt(document.getElementById('openTickets').textContent.split(": ")[1]);

    document.getElementById('totalTickets').textContent = `Total Tickets: ${total + 1}`;
    document.getElementById('openTickets').textContent = `Open Tickets: ${open + 1}`;
}

function decrementOpenTicketCount() {
    let open = parseInt(document.getElementById('openTickets').textContent.split(": ")[1]);
    let closed = parseInt(document.getElementById('closedTickets').textContent.split(": ")[1]);

    document.getElementById('openTickets').textContent = `Open Tickets: ${open - 1}`;
    document.getElementById('closedTickets').textContent = `Closed Tickets: ${closed + 1}`;
}

// function to close modal

function closeModal() {
    const modal = document.getElementById('ticketDetailsModal');
    if (modal) {
        modal.style.display = 'none';
    }
    window.location.href = 'admin.html#results';
}

document.addEventListener('DOMContentLoaded', function () {
    fetchTickets(1);
});

document.addEventListener('DOMContentLoaded', function () {
    setupEventListeners();
    fetchTickets();
});

function setupEventListeners() {

    document.getElementById('perPageSelect').addEventListener('change', function () {
        fetchTickets(1);
    });

    ['filterByIssueType', 'filterByUserType', 'filterByStatus', 'sortBy'].forEach(id => {
        document.getElementById(id).addEventListener('change', () => fetchTickets(1));
    });
}


// function to export JSON data from SQL

function exportData() {
    fetch('src/php/jsonExport.php')
        .then(response => {
            if (response.ok) {
                return response.blob();
            }
            throw new Error('Network response was not ok.');
        })
        .then(blob => {

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = 'feedbackData.json';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            alert('Your file has been downloaded!');
        })
        .catch(error => console.error('Error downloading the file:', error));
}
