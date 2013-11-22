function GoogleContactsUserProfileTranslator() {	
}
GoogleContactsUserProfileTranslator.prototype.getMatchPatterns = function() {
	return [ '^acct:googlecontacts:[0-9]+', '/user/[0-9]+' ];
}
GoogleContactsUserProfileTranslator.prototype.translate = function( uri, owner, rawDoc, callback ) {
	try {
		var userProfile = JSON.parse( rawDoc.data );

		// Translated to fields more or less compliant with the OpenSocial 2.5.0 draft 
		// spec (opensocial-social-data-specification-2-5-0-draft):
		// http://opensocial-resources.googlecode.com/svn/spec/trunk/Social-Data.xml
		var result = {
			// Required fields by spec
			'id': uri,
			'displayName': {'formatted': userProfile.name },

			// Additional required fields for UI
			'preferredUsername': userProfile.email,
			'thumbnailUrl': userProfile.picture,
			'appData': { 
				'serviceName': 'Google Contacts',
				'serviceImgUrl': '/images/512x512-logos/googlecontacts.png'
			},
			'urls': [ userProfile.link ],
			'emails': [ userProfile.email ],
			'birthday': userProfile.birthday,
			'gender': userProfile.gender,
			'languagesSpoken': [ userProfile.locale ]
		};
		if( !result.thumbnailUrl )
			result.thumbnailUrl = '/images/generic_user_image.jpeg';

		var outputData = {
			'uri': uri,
			'owner': owner,
			'category': 'person',
			'data': result
		};
        NLPService.addAnalysisIfMissing( outputData, function( error, result ) {
   			if( !error )
   			{
				EventService.emit( "document::translated", result );
   			}
        	process.nextTick( function() {
        		callback( error, result.data );
        	});
   		});
	} catch( err ) {
		SystemLog.log('Request timed out at document translation,  [' + uri + ']', err);
                callback(  err , null );
	}
}
module.exports = exports = GoogleContactsUserProfileTranslator;