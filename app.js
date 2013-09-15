var app = angular.module('app', []);

var audFormats = ['wav', 'mp3'];
var vidFormats = ['3gp', '3gpp', 'avi', 'flv', 'mov', 'mpeg', 'mpeg4', 'mp4', 'webm', 'wmv'];
var validFormats = audFormats.concat(vidFormats);

app.controller('PlayerController', ['$scope', function($scope){
	$scope.currentAudio = null;
	$scope.currentVideo = null;

	$scope.$on('file_clicked', function(event, fileEntry){
		var reader = new FileReader(),
        url;

    reader = window.URL || window.webKitURL;
		
    
		fileEntry.file(function(file){
			//reader.readAsDataURL(file);
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
  $scope.currentlyPlaying = null;

  $scope.loadAndPlay = function(file){
  	$scope.currentlyPlaying = file.fullPath;
  	$scope.$root.$broadcast('file_clicked', file);  	
  };

  var getFileTree = function(entries){
    var entry,
        galleryReader,
        node;


    for(var i = 0; i < entries.length; i++)
    {
      entry = entries[i];
      if(entry.constructor.name === 'FileEntry')
      {
        $scope.tree.push(entry);
      }
      else if(entry.constructor.name === 'DirectoryEntry')
      {

        galleryReader = entry.createReader();
        galleryReader.readEntries(function(entries){
          getFileTree(entries);
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
