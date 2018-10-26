/*
    creator.html is what user must navigate to:
		On windows if want to create/edit media
		On other OSs if want to use created (but unpublished) media (ie we pass userEmail and bucketName to app (using launch app mechanism) which stores them)
	
	On windows:
		First we get the userEmail and bucket from server (using my clever server call launchTargetUrlWithUserParams which redirects here but with params set)
		Then we send the "initialise" command  in an XMLHttpRequest (with userEmail and bucket as params) to the app which responds with the webVersion that app is using.

LOGIC
	menu.html also needs to get correct version 

	while notapp running then
		notify and wait
	end
	get user info and lua version from app
	deduce js version from lua version using versionMap.js
	if creator then
		menuType = "creator"
		if online then
			if signed in then
				if signed in user differs from app user info then
					notify and give options:
						sign out?
						sign in as different user?
						continue as this user?
				end
			end
		end
	else (menu)
		menuType = "player"

	end
	if signedIn and creator then 
		call redirect to <js version>/app.html through server to get user info in params  - maybe set param instigator and/or signedin=true
	else
		redirect to <js version>/app.html using windows.location - maybe set param instigator and/or signedin=false
	end

		


get lua version from app (ie lua)
					if no app then notify etc
				get user (email/bucket) from app
				try to get user from server
				resolve all the above! -
					eg C++/Lua tries to get Lua version from server
						If fails (ie offline) then use appcached vars and of course don't try to download zip.






*/


var userEmail, bucketName, instigator; //currentReleaseVersion correct/true?
userEmail = "fred";
var yOpenWindow = false;

function init() {
	if (loadPageWithUserEmailBucketAndCurrentReleaseVersionParamsIfNec()) {
		//alert("user data params got successfully!"); // debug
		console.log("user data params got successfully!");

		var isWindows = navigator.userAgent.toLowerCase().match('windows');
		if (isWindows) {
			//			initComms();
			// Send userEmail and bucketName to app and get webVersion used by app.
			userEmail = getRequestParam("userEmail"); // Without this userEmail is undefined - but WHY?!!! (ie after loadPageWithUserEmailBucketAndCurrentReleaseVersionParamsIfNec)
			bucketName = getRequestParam("bucketName"); // Without this bucketName is undefined - but WHY?!! (ie after loadPageWithUserEmailBucketAndCurrentReleaseVersionParamsIfNec)
			instigator = getRequestParam("instigator");
			var versionToUse = getRequestParam("webVersion") || "dev";
			yCalledFromApp = (instigator == "app") || false;
			/*getAppInfo(userEmail, bucketName, 
				function(json) {
						*/
			// set up windows location with correct version parameter
			//	var versionToUse = json.webVersion;
			//	var destinationPageUrl = versionToUse + "/" + "mediaCreate.html?bucketName=" + bucketName + "&userEmail=" + userEmail + "&webVersion=" + versionToUse;
      
      //var destinationPageUrl = versionToUse + "/" + "index.html?bucketName=" + bucketName + "&userEmail=" + userEmail + "&webVersion=" + versionToUse + "&menuSource=unpublished" + "&instigator=" + instigator;
      //var destinationPageUrl = "localhost:3000/index.html?bucketName=" + bucketName + "&userEmail=" + userEmail + "&webVersion=" + versionToUse + "&menuSource=unpublished" + "&instigator=" + instigator;
      //var destinationPageUrl = window.location.origin + "/index.html?bucketName=" + bucketName + "&userEmail=" + userEmail + "&webVersion=" + versionToUse + "&menuSource=unpublished" + "&instigator=" + instigator;
      
      var subpath = window.location.pathname.startsWith("/creator/")? "" :"creator/";
      var destinationPageUrl = subpath + "index.html?bucketName=" + bucketName + "&userEmail=" + userEmail + "&webVersion=" + versionToUse + "&menuSource=created" + "&instigator=" + instigator;


      //var destinationPageUrl = versionToUse + "/" + "creatorOpenWindow.html?bucketName=" + bucketName + "&userEmail=" + userEmail + "&webVersion=" + versionToUse;
debugger;
			if (yOpenWindow) {
				//var strWindowFeatures = "titlebar=no,location=no,top=0,left=0,height=1024,width=850,scrollbars=yes,status=no"; //, channelmode=yes";
				var strWindowFeatures = "height=1024, width=850"; //, channelmode=yes";
				//var URL = "https://www.linkedin.com/cws/share?mini=true&amp;url=" + location.href;
				//var URL = "http://localhost:8123/dev/mediaCreateGrid7.html?bucketName=mos_mc_qldy5uv956rbds&userEmail=mvellacott@mindofsound.com&webVersion=dev&menuSource=published&s=svs";
				//var openedWindow = window.open(destinationPageUrl, "_blank", strWindowFeatures); // works - nontab window
				var openedWindow = window.open(destinationPageUrl, "_blank", "top=0, left=0, width=1024, height=850"); // works - nontab window
				//window.open("", "", "width=100, height=100");
				//var win = window.open(URL, "_self", strWindowFeatures); 
				//var win = window.open(URL, "_parent", strWindowFeatures); // Works! - but final window is a tab

				//window.close(); // ie parent window! - only works on chrome when browser launched from app!
				//if (ffred) {
		//		openedWindow.resizeTo(850, 1024);                             // Resizes the new window
		//		openedWindow.focus();                                        // Sets focus to the new window
		openedWindow.moveTo(0, 0); // seems does not work on edge
          // see https://stackoverflow.com/questions/8454510/open-url-in-same-window-and-in-same-tab
			} else {
				window.location = destinationPageUrl;
				// close current window? ie close()?
			}
			//			);
		} else {
			//launchApp with params
			$platform = getRequestParam("platform");
			if ($platform == null) { // defensive
				// Simple device detection from browser
				var isiOS = navigator.userAgent.toLowerCase().match('ipad') || navigator.userAgent.toLowerCase().match('iphone') || navigator.userAgent.toLowerCase().match('ipod');
				var isAndroid = navigator.userAgent.toLowerCase().match('android');
				var isWindows = navigator.userAgent.toLowerCase().match('windows');
				if (isiOS) {
					$platform = 'ios';
				} else if (isAndroid) {
					$platform = 'android';
				} else if (isWindows) {
					$platform = 'windows';
				}
			}
			var bucketName = getRequestParam("bucketName");
			var userEmail = getRequestParam("userEmail");
			launchApp("bucketName=" + bucketName + "&userEmail=" + userEmail);
		}
	}

}
startup = init;


function launchApp(sParams) {
	//Minimize();
	//alert("Hi from launchApp!");
	var actualParams = sParams; // + forceAppRelaunchParam;
	//alert("navigator.userAgent = " + navigator.userAgent);
	//alert("navigator.appVersion = " +navigator.appVersion);

	//alert("$platform = " + $platform);
	//alert("actualParams = " + actualParams);
	debugger;
	if ($platform == "ios") {
		url = "mindofsound://" + '?' + actualParams;
		window.location = url;
		setTimeout(function () {
			if (!document.webkitHidden) { // If the user is still here, open the App Store
				// Replace the Apple ID following '/id'
				window.location = "appStorePlaceHolder.html?f=fff"; //'http://itunes.apple.com/app/id1234567';
			}
		}, 25);
	} else if ($platform == "android") {
		if ($webview == "true") {
			//We are running in android WebView
			//alert("actualParams:" + actualParams);
			Android.handleStringFromWebPage(actualParams);
		} else {
			//We are running in actual browser
			//url = "intent://#Intent;scheme=mindofsound;package=com.mos.mindofsound;S.sQuery=" + actualParams + ";end;"
			if (navigator.userAgent.toLowerCase().match("firefox")) {
				url = "mindofsound://?" + actualParams;
			} else {
				url = "intent://#Intent;scheme=mindofsound;package=com.mos.mindofsound;S.sQuery=" + actualParams + ";end;"
			}
			window.location = url;

		}
	} else if ($platform == "windows") {
		if ($webview == "true") {
			alert("Web view not implemented for this version of windows!");
		} else {
			url = "http://localhost:9000/" + '?' + actualParams;
			window.location = url;
		}
	} else {
		window.location = "appStorePlaceHolder.html?f=fff";
	}

}


function loadPageWithUserEmailBucketAndCurrentReleaseVersionParamsIfNec() {
	bucketName = getRequestParam("bucketName"); // we pass this in as parameter since javascript is incapable of getting it through appengine!
	userEmail = getRequestParam("userEmail"); // we pass this in as parameter since javascript is incapable of getting it through appengine!
	currentReleaseVersion = getRequestParam("webVersion"); // we pass this in as parameter since javascript is incapable of getting it through appengine!
	if ((bucketName == null) || (userEmail == null) || (currentReleaseVersion == null)) {
		//alert("missing param"); // debug
		window.location = reflexiveLaunch("gcs/launchTargetUrlWithUserParams", window.location.pathname);
		return false;
	} else {
		return true;
	}
	/*if (bucketName == null) {
		alert("missing bucketName param! Click OK to try again.");
		//window.location = reflexiveLaunch("gcs/launchWithUserId", window.location.pathname);
        window.location = reflexiveLaunch("gcs/launchTargetUrlWithUserParams", window.location.pathname);
	}
	if (userEmail == null) {
		//alert("missing userEmail param! Click OK to try again.");
		//window.location = reflexiveLaunch("gcs/launchWithUserId", window.location.pathname);
        window.location = reflexiveLaunch("gcs/launchTargetUrlWithUserParams", window.location.pathname);

	}
	if (currentReleaseVersion == null) {
		//alert("missing webVersion param! Click OK to try again.");
		//window.location = reflexiveLaunch("gcs/launchWithUserId", window.location.pathname);
        window.location = reflexiveLaunch("gcs/launchTargetUrlWithUserParams", window.location.pathname);
	}*/
}

function getRequestParam(name) {
	if (name = (new RegExp('[?&]' + encodeURIComponent(name) + '=([^&]*)')).exec(location.search))
		return decodeURIComponent(name[1]);
}

function launchWebVersion(serverMethod, targetPath) {
	// launches to appropriate folder version of teargetPath
	var targetUrl = window.location.protocol + "//" + window.location.host + targetPath + window.location.search;
	var launchThisPageUrl = "http://" + "mos-cloud.appspot.com/" + serverMethod + "?targetUrl=" + encodeURIComponent(targetUrl) + "&gotoWebVersion=true";
	return launchThisPageUrl;
}

function reflexiveLaunch(serverMethod, targetPath) {
	// build target url which must/will be in same domain and folder as this url
	//var path = window.location.pathname.substr(1);
	//var secondSlashInd = path.indexOf("/")
	//			var version = deduceThisVersion(); //path.substr(0,secondSlashInd); 
	//			var targetUrl = window.location.protocol + "//" + window.location.host + "/" + version + "/" + targetPath + window.location.search;
	var targetUrl = window.location.protocol + "//" + window.location.host + targetPath + window.location.search;
	//var launchThisPageUrl = "http://" + version + ".mos-cloud.appspot.com/" + serverMethod + "?targetUrl=" + encodeURIComponent(targetUrl); //launches with userId (for bucket)
	var launchThisPageUrl = "http://" + "mos-cloud.appspot.com/" + serverMethod + "?targetUrl=" + encodeURIComponent(targetUrl); //launches with userId (for bucket)
	//var launchThisPageUrl = "http://" + "root.mos-cloud.appspot.com/" + serverMethod + "?targetUrl=" + encodeURIComponent(targetUrl); //launches with userId (for bucket)
	//alert("launchThisPageUrl = " + launchThisPageUrl);
	return launchThisPageUrl;
}

function launchApp(sParams) {
	//Minimize();
	//alert("Hi from launchApp!");
	var actualParams = sParams; // + forceAppRelaunchParam;
	//alert("navigator.userAgent = " + navigator.userAgent);
	//alert("navigator.appVersion = " +navigator.appVersion);

	//alert("$platform = " + $platform);
	//alert("actualParams = " + actualParams);
	debugger;
	if ($platform == "ios") {
		url = "mindofsound://" + '?' + actualParams;
		window.location = url;
		setTimeout(function () {
			if (!document.webkitHidden) { // If the user is still here, open the App Store
				// Replace the Apple ID following '/id'
				window.location = "appStorePlaceHolder.html?f=fff"; //'http://itunes.apple.com/app/id1234567';
			}
		}, 25);
	} else if ($platform == "android") {
		if ($webview == "true") {
			//We are running in android WebView
			//alert("actualParams:" + actualParams);
			Android.handleStringFromWebPage(actualParams);
		} else {
			//We are running in actual browser
			//url = "intent://#Intent;scheme=mindofsound;package=com.mos.mindofsound;S.sQuery=" + actualParams + ";end;"
			if (navigator.userAgent.toLowerCase().match("firefox")) {
				url = "mindofsound://?" + actualParams;
			} else {
				url = "intent://#Intent;scheme=mindofsound;package=com.mos.mindofsound;S.sQuery=" + actualParams + ";end;"
			}
			window.location = url;

		}
	} else if ($platform == "windows") {
		if ($webview == "true") {
			alert("Web view not implemented for this version of windows!");
		} else {
			url = "http://localhost:" + appServerPort + "/" + '?' + actualParams;
			window.location = url;
		}
	} else {
		window.location = "appStorePlaceHolder.html?f=fff";
	}

}