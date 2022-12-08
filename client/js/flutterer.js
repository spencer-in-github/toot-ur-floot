/**
 * File: flutterer.js
 * ------------------
 * Contains the logic that makes Flutterer work, as well as all initialization.
 */
"use strict";

//    function ProfilePicture(name, imageUrl) {
//        let image = document.createElement("img");
//        image.src = imageUrl;
//        image.className = "user-photo";
//        image.alt = "User Profile Image for " + name;
//        return image;
//    }

//    function Floot(floot, loggedInUser, actions) {
//        let card = document.createElement("div");
//        card.classList.add("card");
//        card.classList.add("floot-card");
//        card.appendChild(ProfilePicture(floot.username,
//                                        "img/" + floot.username + ".jpg"));
//        card.appendChild(FlootContent(floot.username, floot.message));
//        card.appendChild(LikeCommentCount(floot, loggedInUser, toggleLike));
//        return card;
//    }

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
// let div = document.getElementById("primary-container");

/**
 * Function: Flutterer
 * -------------------
 * Flutterer's entry point
 */
function Flutterer() {
    // TODO: Implement this function, starting in Milestone 2

    let req = AsyncRequest("url");
    req.addParams({json: true});
    req.setSuccessHandler(
        function(response) {
            let payload = response.getPayload();
            let info = JSON.parse(payload);
        });
    req.send();
    document.body.appendChild(MainComponent(USERS[0], info, {}));


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
 *
 * Returns a node with the following structure:
 *   <div class="primary-container">
 *       <Sidebar />
 *       <NewsFeed />
 *   </div>
 */


function MainComponent(selectedUser, floots, actions) {
    // TODO: Implement this component in Milestone 2
    // let main_div = document.createElement("primary-container");
    let main_div = document.createElement("div");
    main_div.classList.add("primary-container");

    main_div.appendChild(Sidebar(USERS, floots, actions));

    main_div.appendChild(NewsFeed(selectedUser, floots, actions));

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
