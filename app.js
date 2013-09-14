var app = angular.module('app', []);

var audFormats = ['wav', 'mp3'];
var vidFormats = ['3gp', '3gpp', 'avi', 'flv', 'mov', 'mpeg', 'mpeg4', 'mp4', 'webm', 'wmv'];
var validFormats = audFormats.concat(vidFormats);

app.controller('PlayerController', ['$scope', function($scope){
	$scope.currentAudio = null;
	$scope.currentVideo = null;

	$scope.$on('file_clicked', function(event, file){
		var reader = new FileReader();
		reader.onloadend = function(){
			var extension = file.name.split('.').pop();
			if(audFormats.indexOf(extension) > -1)
			{
				$scope.currentAudio = this.result;	
			}

			/*if(vidFormats.indexOf(extension) > -1)
			{
				$scope.currentVideo = this.result;
			}*/

			
			$scope.$apply();
		};
		
		file.file(function(fff){
			reader.readAsDataURL(fff);
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


  // if the app was restarted, get the media gallery information
  chrome.mediaGalleries.getMediaFileSystems({
     interactive : 'if_needed'
  }, function(galleries){
  	galleries.forEach(function(item, index, array){
  		var meta_data = chrome.mediaGalleries.getMediaFileSystemMetadata(item);
  		var library = {
  			name: meta_data.name,
  			nodes: []
  		};

  		galleryReader = item.root.createReader();
   		galleryReader.readEntries(function(entries){
   			var entry;
   			var extension;
   			for(var i in entries)
   			{
   				entry = entries[i];
   				if(entry.constructor.name === 'FileEntry')
   				{
   					extension = entry.name.split('.').pop();
   					if(validFormats.indexOf(extension) > -1)
   					{
   						library.nodes.push(entry);	
   					}   					
   				}
   			}

   			if(library.nodes.length > 0)
   			{
   				$scope.tree.push(library);	
   			}   
   			delete this.library;			
   			  		
   			$scope.$apply();   			
   		});
  	});
  });
}]);
