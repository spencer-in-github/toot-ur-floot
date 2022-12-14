/**
 * File: flutterer.js
 * ------------------
 * Contains the logic that makes Flutterer work, as well as all initialization.
 */
"use strict";

// Specify a list of valid users. (Extension opportunity: You can create an
// API route that lets users sign up, and then here, you can load a list of
// registered users.)
const USERS = [
    "Sophie Andrews",
    "Stephan Sharkov",
    "Ryan Guan",
    "Jonathan Kula",
    "Avi Gupta",
];

// Specify API server URL.
const URL = "http://localhost:1066/api/floots"

/**
 * Function: Flutterer
 * -------------------
 * Flutterer's entry point
 */
function Flutterer() {
    // A placeholder for the current selected user.
    let current_user = USERS[0]; 

    AsyncRequest(URL)
        .setSuccessHandler(initialize)
        .send();

    let actions = {
        changeSelectedUser: changeSelectedUser,
        postNewFloot: postNewFloot,
        deleteFloot: deleteFloot,
        openFlootModal: openFlootModal,
        closeFlootModal: closeFlootModal,
        addComment: addComment,
        deleteComment: deleteComment
    };

    function initialize(response) {
        let payload = response.getPayload();
        let info = JSON.parse(payload);
        document.body.appendChild(MainComponent(current_user, info, actions));
    }

    function changeSelectedUser(username) {
        // TODO: selected username color on sidebar is not showing as blue
        while (document.body.lastChild != null) {
            document.body.removeChild(document.body.lastChild);
        }
        current_user = username;
        refresh();
    }

    function refresh(){
        
        AsyncRequest(URL)
            .setSuccessHandler(initialize)
            .send();
    }

    function postNewFloot(username, message) {
        while (document.body.lastChild != null) {
            document.body.removeChild(document.body.lastChild);
        }
        // request
        AsyncRequest(URL)
            .setMethod("POST")
            .setPayload(JSON.stringify({
                username: username,
                message: message
            }))
            .setSuccessHandler(refresh)
            .send()
    }

    function deleteFloot(flootInfo){
        while (document.body.lastChild != null) {
            document.body.removeChild(document.body.lastChild);
        }
        // request
        let url = URL + "/" + flootInfo.id + "/delete"
        AsyncRequest(url)
            .setMethod("POST")
            .setPayload(JSON.stringify({
                username: flootInfo.username
            }))
            .setSuccessHandler(refresh)
            .send();
    }

    function openFlootModal(flootInfo, selectedUser, actions){
        let modal = FlootModal(flootInfo, selectedUser, actions);
        while (document.body.lastChild != null) {
            document.body.removeChild(document.body.lastChild);
        }
        AsyncRequest(URL)
        .setSuccessHandler(addModal)
        .send();

        function addModal(response){
            let payload = response.getPayload();
            let info = JSON.parse(payload);
            document.body.appendChild(MainComponent(current_user, info, actions, modal));
        }
    }

    function closeFlootModal(){
        console.log("close modal executed");
        while (document.body.lastChild != null) {
            document.body.removeChild(document.body.lastChild);
        }
        refresh();
    }

    function addComment(flootInfo, comment){
        while (document.body.lastChild != null) {
            document.body.removeChild(document.body.lastChild);
        }
        // request
        let url = URL + "/" + flootInfo.id + "/comments"
        AsyncRequest(url)
            .setMethod("POST")
            .setPayload(JSON.stringify({
                username: flootInfo.username,
                message: comment
            }))
            .setSuccessHandler(stayOnTheModal) //TODO: should not close the modal when comment is submitted
            .send();

        function stayOnTheModal(){
            let url = URL + "/" + flootInfo.id 
            AsyncRequest(url)
                .setSuccessHandler(openTheModal) //TODO: should not close the modal when comment is submitted
                .send();

            function openTheModal(response){
                let payload = response.getPayload();
                let newFlootInfo = JSON.parse(payload);
                openFlootModal(newFlootInfo, current_user, actions);
            }
        }
    }

    function deleteComment(flootId, commentId){
        while (document.body.lastChild != null) {
            document.body.removeChild(document.body.lastChild);
        }
        // request
        let url = URL + "/" + flootId + "/comments/" + commentId + "/delete"
        AsyncRequest(url)
            .setMethod("POST")
            .setPayload(JSON.stringify({
                username: current_user,
            }))
            .setSuccessHandler(refresh) //TODO: should not close the modal when comment is submitted
            .send();
    }
}

/**
 * Component: MainComponent
 * ------------------------
 * Constructs all the elements that make up the page.
 *
 * Parameters:
 *   * selectedUser: username of the logged-in user (string)
 *   * floots: an array of floot aggregates/objects that make up the news feed
 *   * actions: an aggregate containing a variety of functions that can be used
 *     to change the page or send data to the server (e.g. change the currently
 *     logged-in user, delete floots, etc.)
 *   * TODO: In Milestone 7: a parameter that contains the floot object that
 *     should be displayed in a modal, or null if no floot has been clicked and
 *     the modal should not be displayed
 *   * modal: the modal object of current opened floot; null if no floot clicked
 *
 * Returns a node with the following structure:
 *   <div class="primary-container">
 *       <Sidebar />
 *       <NewsFeed />
 *   </div>
 */
function MainComponent(selectedUser, floots, actions, modal = null) {
    let main_div = document.createElement("div");
    main_div.classList.add("primary-container");

    console.log("floots when initializing MainComponent, ", floots);
    main_div.appendChild(Sidebar(USERS, floots, actions));
    main_div.appendChild(NewsFeed(selectedUser, floots, actions));
    if (modal != null){
        main_div.appendChild(modal);
    }
    return main_div;
}

/**
 * NOTE TO STUDENTS: you don't need to understand anything below.  It's fancy
 * JavaScript we need to help make the development process a little easier.
 *
 * The following code uses some Javascript magic so that all network requests
 * are logged to the browser console. You can still view all network requests
 * in the Network tab of the browser console, and that may be more helpful (it
 * provides much more useful information), but students may find this handy for
 * doing quick debugging.
 */

(() => {
    function log_info(msg, ...extraArgs) {
        console.info("%c" + msg, "color: #8621eb", ...extraArgs);
    }
    function log_success(msg, ...extraArgs) {
        console.info("%c" + msg, "color: #39b80b", ...extraArgs);
    }
    function log_error(msg, ...extraArgs) {
        console.warn("%c" + msg, "color: #c73518", ...extraArgs);
    }
    const _fetch = window.fetch;
    window.fetch = function(...args) {
        log_info(`Making async request to ${args[1].method} ${args[0]}...`);
        return new Promise((resolve, reject) => {
            _fetch(...args).then((result) => {
                const our_result = result.clone();
                our_result.text().then((out_text) => {
                    if (our_result.ok) {
                        log_success(`Server returned successful response for ${our_result.url}`);
                    } else {
                        log_error(`Server returned Error ${our_result.status} `
                            + `(${our_result.statusText}) for ${our_result.url}`,
                            out_text);
                    }
                    resolve(result);
                });
            }, (error) => {
                log_error('Error!', error);
                reject(error);
            });
        });
    };

    log_info("Did you know?", "For this assignment, we have added some code that "
        + "logs network requests in the JS console. However, the Network tab "
        + "has even more useful information. If you are having problems with API "
        + "calls, the Network tab may be a good place to check out; you can see "
        + "POST request bodies, full server responses, and anything else you might "
        + "desire there.");
})();

document.addEventListener("DOMContentLoaded", Flutterer);
