// Trigerred when a new member joins the call
let handleMemberJoined = async (MemberId) => {
    console.log('A new member has joined the room:', MemberId)
    // Loads the HTML components for all users
    addMemberToDom(MemberId)

    // Updates the total number of members when a new member joins the call
    let members = await channel.getMembers()
    updateMemberTotal(members)

    // Greets the new user with a "Welcome" message
    let {name} = await rtmClient.getUserAttributesByKeys(MemberId, ['name'])
    addBotMessageToDom(`Welcome to the room ${name}! 👋`)
}

// 1. Creates WebRTC client for the new member
// 2. Adds the new memberr to the member_list
// 3. Loads all the HTML components of the newly added member to the screen
let addMemberToDom = async (MemberId) => {
    let {name} = await rtmClient.getUserAttributesByKeys(MemberId, ['name'])

    let membersWrapper = document.getElementById('member__list')
    let memberItem = `<div class="member__wrapper" id="member__${MemberId}__wrapper">
                        <span class="green__icon"></span>
                        <p class="member_name">${name}</p>
                    </div>`

    membersWrapper.insertAdjacentHTML('beforeend', memberItem)
}

// 1. Get the most recent member list and
// 2. Render the member list count to the html component
let updateMemberTotal = async (members) => {
    let total = document.getElementById('members__count')
    total.innerText = members.length
}
 

// 1. Trigerred when member leaves the call
// 2. Handles the removal of HTML components of the user that left the call
// 3. Handles the new count by invoking updateMemberTotal method
let handleMemberLeft = async (MemberId) => {
    removeMemberFromDom(MemberId)

    let members = await channel.getMembers()
    updateMemberTotal(members)
}

// 1. Once the member leaves, we remove all the HTML components accosiated to them
let removeMemberFromDom = async (MemberId) => {
    let memberWrapper = document.getElementById(`member__${MemberId}__wrapper`)
    let name = memberWrapper.getElementsByClassName('member_name')[0].textContent
    addBotMessageToDom(`${name} has left the room.`)
        
    memberWrapper.remove()
}

// When called returns the list of members asynchronously
// 1. Updates the member count
// 2. For each member, adds the member element to the HTML document
let getMembers = async () => {
    let members = await channel.getMembers()
    updateMemberTotal(members)
    for (let i = 0; members.length > i; i++){
        addMemberToDom(members[i])
    }
}

// Handles new messages added to the channel and renders it into the UI
// 1. Message data and the member id is passed to to the function
// 2. There are 3 types of messages
//   A. Chat Message
//   B. User Joined Message
//   C. User Left Message
// 3. Handle each message seperately
let handleChannelMessage = async (messageData, MemberId) => {
    console.log('A new message was received')
    let data = JSON.parse(messageData.text)

    if(data.type === 'chat'){
        addMessageToDom(data.displayName, data.message)
    }

    if(data.type === 'user_left'){
        document.getElementById(`user-container-${data.uid}`).remove()

        if(userIdInDisplayFrame === `user-container-${uid}`){
            displayFrame.style.display = null
    
            for(let i = 0; videoFrames.length > i; i++){
                videoFrames[i].style.height = '300px'
                videoFrames[i].style.width = '300px'
            }
        }
    }
}


// Sends message to the messaging channel
// Set the type=chat in the message metadata JSON
let sendMessage = async (e) => {
    e.preventDefault()

    let message = e.target.message.value
    channel.sendMessage({text:JSON.stringify({'type':'chat', 'message':message, 'displayName':displayName})})
    addMessageToDom(displayName, message)
    e.target.reset()
}


// Renders message UI components to the HTML document
let addMessageToDom = (name, message) => {
    let messagesWrapper = document.getElementById('messages')

    // Create a new message component
    let newMessage = `<div class="message__wrapper">
                        <div class="message__body">
                            <strong class="message__author">${name}</strong>
                            <p class="message__text">${message}</p>
                        </div>
                    </div>`

    messagesWrapper.insertAdjacentHTML('beforeend', newMessage)

    let lastMessage = document.querySelector('#messages .message__wrapper:last-child')
    if(lastMessage){
        lastMessage.scrollIntoView()
    }
}

// Adds Bot messages, greeting messages, joined messages, and left messages to the screen
let addBotMessageToDom = (botMessage) => {
    let messagesWrapper = document.getElementById('messages')

    let newMessage = `<div class="message__wrapper">
                        <div class="message__body__bot">
                            <strong class="message__author__bot">🤖 Chiral Bot</strong>
                            <p class="message__text__bot">${botMessage}</p>
                        </div>
                    </div>`

    messagesWrapper.insertAdjacentHTML('beforeend', newMessage)

    let lastMessage = document.querySelector('#messages .message__wrapper:last-child')
    if(lastMessage){
        lastMessage.scrollIntoView()
    }
}

// Leave the channel
// Close the local RTC/RTM Client
let leaveChannel = async () => {
    await channel.leave()
    await rtmClient.logout()
}

window.addEventListener('beforeunload', leaveChannel)
let messageForm = document.getElementById('message__form')
messageForm.addEventListener('submit', sendMessage)