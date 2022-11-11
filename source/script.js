/** This script is the main content script used by Threatslayer. It is
 * executed every time the user visits a page.
 */


/**
 * This function handles the response from the API. If the response
 * indicates that a URL is malicious, the user will be prompted, and
 * the page will be bordered with red. If the URL is *not* malicious,
 * a console message will be logged. If the API is unresponsive, or
 * fails to provide a response for some other reason, the page is
 * bordered in yellow to inform the user to proceed with caution.
 *
 * @param {} response - the response from the API, an object with an attribute of `malicious`
 */
function handleAPIResponse(response) {
	
	// prepare visual indicator canvas object
	//
	// NOTE: The ideal way to accomplish this is to inject CSS and script via
	//		 chrome.scripting.executeScript and chrome.scripting.insertCSS.
	//		 I cannot however, figure out how to get chrome.scripting to work
	//		 outside the background env. This is ugly and should be refactored.
	//
	var box = document.createElement("canvas");
	var boxWrapper = document.createElement("div");
	box.style.bottom = "auto";
	box.style.position = "fixed";
	box.style.width = "100%";
	box.style.height = "100%";
	box.style.zIndex = "40000";
	box.style.pointerEvents = "none";
	
	
    if (response == null)
    {
        console.log("API Unresponsive. Cannot verify safety of: " +
                    window.location.href +
                    ".");
	// finish up wrapped html and inject into body
	box.style.border = "6px dashed yellow";
	boxWrapper.appendChild(box);
	document.body.insertBefore(boxWrapper, document.body.childNodes[0]);

    } else if (response.malicious == false)
    {
        console.log("URL " +
                    window.location.href +
                    " not classified as malicious.");

    } else if (response.malicious == true)
    {
        alert("The URL you are visiting: " + 
              window.location.href + 
              " is potentially malicious! Proceed at your own risk.");
	// finish up wrapped html and inject into body
	box.style.border = "6px dashed red";
	boxWrapper.appendChild(box);
	document.body.insertBefore(boxWrapper, document.body.childNodes[0]);
    }
}

/**
 * Due to security concerns in content scripts, Chrome requires us to
 * execute cross-origin XHR using a service worker. Therefore, we send
 * a message to our service worker, which then performs the request,
 * and asynchronously provides a response.
 */
chrome.runtime.sendMessage(
    {contentScriptQuery: "queryURL", url: window.location.href},
    function (response) {
        if (response != undefined && response != "") {
            handleAPIResponse(response);
        }
        else {
            handleAPIResponse(null);
        }
    });
