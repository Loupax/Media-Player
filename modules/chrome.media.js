/**
 * Module that contains media gallery related functionality
 */
angular.module('chrome.media', []).factory('MediaService', ['$timeout', function($timeout) {
	var MediaService = {};
	
	// Supported audio formats
	MediaService.audioFormats = ['wav', 'mp3', 'ogg'];
	// Supported video formats
	MediaService.videoFormats = ['3gp', '3gpp', 'avi', 'flv', 'mov', 'mpeg', 'mpeg4', 'mp4', 'webm', 'wmv'];
	// All the valid formats in a single array to simplify checks in the future
	MediaService.validFormats = MediaService.audioFormats.concat(MediaService.videoFormats);
	
	MediaService.fileList = [];
	
	var getFileTree = function(entries) {
		var entry, galleryReader, extension;
	
		for (var i = 0; i < entries.length; i++) {
			entry = entries[i];
			extension = entry.name.split('.').pop();

			if (entry.constructor.name === 'FileEntry') {
				if (MediaService.validFormats.indexOf(extension) > -1) {					
					MediaService.fileList.push(entry);					
				}
			} else if (entry.constructor.name === 'DirectoryEntry') {

				galleryReader = entry.createReader();
				galleryReader.readEntries(function(entries) {
					getFileTree(entries);
				});
			}
		}	
	};

		
	MediaService.reload = function() {
		MediaService.fileList.length = 0;
		// if the app was restarted, get the media gallery information
		chrome.mediaGalleries.getMediaFileSystems({
			interactive : 'if_needed'
		}, function(galleries) {
			galleries.forEach(function(item, index, array) {
				galleryReader = item.root.createReader();
				galleryReader.readEntries(function(entries) {
					$timeout(function(){
						getFileTree(entries);
					});
				});
			});
		});
	};
	
	return MediaService;
} ]);