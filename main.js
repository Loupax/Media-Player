// Use the runtime event listeners to set a window property indicating whether the
// app was launched normally or as a result of being restarted

chrome.app.runtime.onLaunched.addListener(function(data) {
    chrome.app.window.create('index.html', 
    	{bounds: {width:900, height:600}, minWidth:400, minHeight:200, id:"MGExp"}, 
    	function(app_win) {
    		app_win.contentWindow.__MGA__bRestart = false;
    	}
    );
});

chrome.app.runtime.onRestarted.addListener(function() {
    chrome.app.window.create('index.html', 
    	{bounds: {width:900, height:600}, minWidth:400, minHeight:200, id:"MGExp"}, 
    	function(app_win) {
    		app_win.contentWindow.__MGA__bRestart = true;
    	}
    );
});