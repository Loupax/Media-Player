var app = angular.module('app', []);

// Supported audio formats
var audFormats = ['wav', 'mp3', 'ogg'];
// Supported video formats
var vidFormats = ['3gp', '3gpp', 'avi', 'flv', 'mov', 'mpeg', 'mpeg4', 'mp4', 'webm', 'wmv'];
// All the valid formats in a single array to simplify checks in the future
var validFormats = audFormats.concat(vidFormats);

// The controller if the Player pane. Contains the audio and video player tags
app.controller('PlayerController', ['$scope', function($scope, $element){
	// Strings that will contain media URLs when files are selected
	$scope.currentAudio = null;
	$scope.currentVideo = null;

	var video = document.querySelector('video');
	var audio = document.querySelector('audio');

  	// Event listener that requests the next file
	var playNext = function(e){
		$scope.$root.$broadcast('request_next_file');
	}; 

  	// When the media playback is completed, request the next item
  	video.addEventListener('ended', playNext);
  	audio.addEventListener('ended', playNext);

	// When the user clicks on a file from the file explorer, read it
	$scope.$on('file_clicked', function(event, fileEntry){
		var reader = new FileReader(),
        	    url;
    		reader = window.URL || window.webKitURL;
		
    
		fileEntry.file(function(file){
		
      			var extension = file.name.split('.').pop();
      			url = URL.createObjectURL(file);
      
		      	if(vidFormats.indexOf(extension) > -1)
		      	{
			        $scope.currentVideo = url;  
			        $scope.currentAudio = '';
			}
		      	else if(audFormats.indexOf(extension) > -1)
		      	{
		        	$scope.currentAudio = url;
		        	$scope.currentVideo = '';
		      	}
		      
      			delete url;
      			$scope.$apply();
		});
	});
}]);


app.controller('FileListController', ['$scope', function($scope) {
  $scope.tree = [];
  $scope.listFilter = '';
  $scope.currentFileIndex = -1;
  // Both the file list and the player need to know these settings. If the app
  // becomes more complex, this should be considered to go to it's own service...
  $scope.$root.autoplay = true;
  $scope.$root.repeat   = false;
  $scope.$root.currentFilename = '';

  $scope.$watch('autoplay', function(new_value, old_value){
    // This is NOT a good practice. The file list controller should not touch
    // the elements of the player controller. Doing this that way in order to
    // keep things simple but for larger apps, a service should be considered
    var video = document.querySelector('video');
    var audio = document.querySelector('audio');
    audio.autoplay = new_value;
    video.autoplay = new_value;
  });

  $scope.$on('request_next_file', function(){

    if($scope.currentFileIndex < $scope.tree.length - 1)
    {
      if($scope.autoplay){
        $scope.currentFileIndex++;
        $scope.$root.$broadcast('file_clicked', $scope.tree[$scope.currentFileIndex]);
      }
    }
    else
    {
      if($scope.repeat){
        $scope.currentFileIndex = 0;
        $scope.$root.$broadcast('file_clicked', $scope.tree[$scope.currentFileIndex]);
      }
    }
    
  });

  $scope.isCurrentlyPlayingFile = function(file){
    return $scope.tree.indexOf(file) === $scope.currentFileIndex;
  }

  $scope.loadAndPlay = function(file){
    $scope.currentFileIndex = $scope.tree.indexOf(file);   
  	$scope.$root.$broadcast('file_clicked', file); 
  };

  var getFileTree = function(entries){
    var entry,
        galleryReader,
        extension;


    for(var i = 0; i < entries.length; i++)
    {
      entry = entries[i];
      extension = entry.name.split('.').pop();

      if(entry.constructor.name === 'FileEntry')
      {
        if(validFormats.indexOf(extension) > -1) {
          $scope.tree.push(entry);
          
          $scope.tree.sort(naturalSort);
          $scope.$apply();
        }
      }
      else if(entry.constructor.name === 'DirectoryEntry')
      {

        galleryReader = entry.createReader();
        galleryReader.readEntries(function(entries){
          getFileTree(entries);

          $scope.tree.sort(naturalSort);
          $scope.$apply();
        });
      }
    }
  };

  // if the app was restarted, get the media gallery information
chrome.mediaGalleries.getMediaFileSystems({
     interactive : 'if_needed'
  }, function(galleries){
  	galleries.forEach(function(item, index, array){
  		galleryReader = item.root.createReader();
   		galleryReader.readEntries(function(entries){
   			var extension;
        var library = {};
        getFileTree(entries);        
   		});      
  	});
  });
}]);


/*
 * Natural Sort algorithm for Javascript - Version 0.7 - Released under MIT license
 * Author: Jim Palmer (based on chunking idea from Dave Koelle)
 *
 * Changed so it can sort objects by their name attribute
 */
 function naturalSort (a, b) {
    a = a.name, b = b.name;
    var re = /(^-?[0-9]+(\.?[0-9]*)[df]?e?[0-9]?$|^0x[0-9a-f]+$|[0-9]+)/gi,
        sre = /(^[ ]*|[ ]*$)/g,
        dre = /(^([\w ]+,?[\w ]+)?[\w ]+,?[\w ]+\d+:\d+(:\d+)?[\w ]?|^\d{1,4}[\/\-]\d{1,4}[\/\-]\d{1,4}|^\w+, \w+ \d+, \d{4})/,
        hre = /^0x[0-9a-f]+$/i,
        ore = /^0/,
        i = function(s) { return naturalSort.insensitive && (''+s).toLowerCase() || ''+s },
        // convert all to strings strip whitespace
        x = i(a).replace(sre, '') || '',
        y = i(b).replace(sre, '') || '',
        // chunk/tokenize
        xN = x.replace(re, '\0$1\0').replace(/\0$/,'').replace(/^\0/,'').split('\0'),
        yN = y.replace(re, '\0$1\0').replace(/\0$/,'').replace(/^\0/,'').split('\0'),
        // numeric, hex or date detection
        xD = parseInt(x.match(hre)) || (xN.length != 1 && x.match(dre) && Date.parse(x)),
        yD = parseInt(y.match(hre)) || xD && y.match(dre) && Date.parse(y) || null,
        oFxNcL, oFyNcL;
    // first try and sort Hex codes or Dates
    if (yD)
        if ( xD < yD ) return -1;
        else if ( xD > yD ) return 1;
    // natural sorting through split numeric strings and default strings
    for(var cLoc=0, numS=Math.max(xN.length, yN.length); cLoc < numS; cLoc++) {
        // find floats not starting with '0', string or 0 if not defined (Clint Priest)
        oFxNcL = !(xN[cLoc] || '').match(ore) && parseFloat(xN[cLoc]) || xN[cLoc] || 0;
        oFyNcL = !(yN[cLoc] || '').match(ore) && parseFloat(yN[cLoc]) || yN[cLoc] || 0;
        // handle numeric vs string comparison - number < string - (Kyle Adams)
        if (isNaN(oFxNcL) !== isNaN(oFyNcL)) { return (isNaN(oFxNcL)) ? 1 : -1; }
        // rely on string comparison if different types - i.e. '02' < 2 != '02' < '2'
        else if (typeof oFxNcL !== typeof oFyNcL) {
            oFxNcL += '';
            oFyNcL += '';
        }
        if (oFxNcL < oFyNcL) return -1;
        if (oFxNcL > oFyNcL) return 1;
    }
    return 0;
}
