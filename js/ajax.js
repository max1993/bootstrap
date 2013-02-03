ajaxSetup: function( target, settings ) {
	if ( settings ) {
		ajaxExtend( target, jQuery.ajaxSettings );
	} else {
		settings = target;
		target = jQuery.ajaxSettings;
	}
	ajaxExtend( target, settings );
	return target;
},

ajaxSettings: {
	url: ajaxLocation,
	isLocal: rlocalProtocol.test( ajaxLocParts[ 1 ] ),
	global: true,
	type: "GET",
	contentType: "application/x-www-form-urlencoded; charset=UTF-8",
	processData: true,
	async: true,
	accepts: {
		xml: "application/xml, text/xml",
		html: "text/html",
		text: "text/plain",
		json: "application/json, text/javascript",
		"*": allTypes
	},

	contents: {
		xml: /xml/,
		html: /html/,
		json: /json/
	},

	responseFields: {
		xml: "responseXML",
		text: "responseText"
	},

	converters: {

		"* text": window.String,

		"text html": true,

		"text json": jQuery.parseJSON,

		// Parse text as xml
		"text xml": jQuery.parseXML
	},

	flatOptions: {
		context: true,
		url: true
	}
},

ajaxPrefilter: addToPrefiltersOrTransports( prefilters ),
ajaxTransport: addToPrefiltersOrTransports( transports ),

ajax: function( url, options ) {

	if ( typeof url === "object" ) {
		options = url;
		url = undefined;
	}

	options = options || {};

	var ifModifiedKey,
		responseHeadersString,
		responseHeaders,
		transport,
		timeoutTimer,
		parts,
		fireGlobals,
		i,
		// Create the final options object
		s = jQuery.ajaxSetup( {}, options ),
		// Callbacks context
		callbackContext = s.context || s,
		// Context for global events
		// It's the callbackContext if one was provided in the options
		// and if it's a DOM node or a jQuery collection
		globalEventContext = callbackContext !== s &&
			( callbackContext.nodeType || callbackContext instanceof jQuery ) ?
					jQuery( callbackContext ) : jQuery.event,
		// Deferreds
		deferred = jQuery.Deferred(),
		completeDeferred = jQuery.Callbacks( "once memory" ),
		// Status-dependent callbacks
		statusCode = s.statusCode || {},
		// Headers (they are sent all at once)
		requestHeaders = {},
		requestHeadersNames = {},
		// The jqXHR state
		state = 0,
		// Default abort message
		strAbort = "canceled",
		jqXHR = {

			readyState: 0,

			// Caches the header
			setRequestHeader: function( name, value ) {if ( !state ) {var lname = name.toLowerCase(); name = requestHeadersNames[ lname ] = requestHeadersNames[ lname ] || name; requestHeaders[ name ] = value; } return this; },
			getAllResponseHeaders: function() {return state === 2 ? responseHeadersString : null; },
			getResponseHeader: function( key ) {var match; if ( state === 2 ) {if ( !responseHeaders ) {responseHeaders = {}; while( ( match = rheaders.exec( responseHeadersString ) ) ) {responseHeaders[ match[1].toLowerCase() ] = match[ 2 ]; } } match = responseHeaders[ key.toLowerCase() ]; } return match === undefined ? null : match; },
			// Overrides response content-type header
			overrideMimeType: function( type ) {if ( !state ) {s.mimeType = type; } return this; },
			// Cancel the request
			abort: function( statusText ) {statusText = statusText || strAbort; if ( transport ) {transport.abort( statusText ); } done( 0, statusText ); return this; } };

	// Callback for when everything is done
	// It is defined here because jslint complains if it is declared
	// at the end of the function (which would be more logical and readable)
	function done( status, nativeStatusText, responses, headers ) {
		var isSuccess, success, error, response, modified,
			statusText = nativeStatusText;

		// Called once
		if ( state === 2 ) {return; }
		// State is "done" now
		state = 2;

		// Clear timeout if it exists
		if ( timeoutTimer ) {clearTimeout( timeoutTimer ); }
		// Dereference transport for early garbage collection
		// (no matter how long the jqXHR object will be used)
		transport = undefined;

		// Cache response headers
		responseHeadersString = headers || "";

		// Set readyState
		jqXHR.readyState = status > 0 ? 4 : 0;

		// Get response data
		if ( responses ) {
			response = ajaxHandleResponses( s, jqXHR, responses );
		}

		// If successful, handle type chaining
		if ( status >= 200 && status < 300 || status === 304 ) {if ( s.ifModified ) {modified = jqXHR.getResponseHeader("Last-Modified"); if ( modified ) {jQuery.lastModified[ ifModifiedKey ] = modified; } modified = jqXHR.getResponseHeader("Etag"); if ( modified ) {jQuery.etag[ ifModifiedKey ] = modified; } } if ( status === 304 ) {statusText = "notmodified"; isSuccess = true; } else {isSuccess = ajaxConvert( s, response ); statusText = isSuccess.state; success = isSuccess.data; error = isSuccess.error; isSuccess = !error; } } else {error = statusText; if ( !statusText || status ) {statusText = "error"; if ( status < 0 ) {status = 0; } } }
		jqXHR.status = status;
		jqXHR.statusText = ( nativeStatusText || statusText ) + "";

		if ( isSuccess ) {
			deferred.resolveWith( callbackContext, [ success, statusText, jqXHR ] );
		} else {
			deferred.rejectWith( callbackContext, [ jqXHR, statusText, error ] );
		}

		// Status-dependent callbacks
		jqXHR.statusCode( statusCode );
		statusCode = undefined;

		if ( fireGlobals ) {
			globalEventContext.trigger( "ajax" + ( isSuccess ? "Success" : "Error" ),
					[ jqXHR, s, isSuccess ? success : error ] );
		}

		// Complete
		completeDeferred.fireWith( callbackContext, [ jqXHR, statusText ] );

		if ( fireGlobals ) {
			globalEventContext.trigger( "ajaxComplete", [ jqXHR, s ] );
			// Handle the global AJAX counter
			if ( !( --jQuery.active ) ) {
				jQuery.event.trigger( "ajaxStop" );
			}
		}
	}
	deferred.promise( jqXHR );
	jqXHR.success = jqXHR.done;
	jqXHR.error = jqXHR.fail;
	jqXHR.complete = completeDeferred.add;

	jqXHR.statusCode = function( map ) {
		if ( map ) {
			var tmp;
			if ( state < 2 ) {
				for ( tmp in map ) {
					statusCode[ tmp ] = [ statusCode[tmp], map[tmp] ];
				}
			} else {
				tmp = map[ jqXHR.status ];
				jqXHR.always( tmp );
			}
		}
		return this;
	};

	s.url = ( ( url || s.url ) + "" ).replace( rhash, "" ).replace( rprotocol, ajaxLocParts[ 1 ] + "//" );

	// Extract dataTypes list
	s.dataTypes = jQuery.trim( s.dataType || "*" ).toLowerCase().split( core_rspace );

	if ( s.crossDomain == null ) {
		parts = rurl.exec( s.url.toLowerCase() );
		s.crossDomain = !!( parts &&
			( parts[ 1 ] !== ajaxLocParts[ 1 ] || parts[ 2 ] !== ajaxLocParts[ 2 ] ||
				( parts[ 3 ] || ( parts[ 1 ] === "http:" ? 80 : 443 ) ) !=
					( ajaxLocParts[ 3 ] || ( ajaxLocParts[ 1 ] === "http:" ? 80 : 443 ) ) )
		);
	}

	if ( s.data && s.processData && typeof s.data !== "string" ) {
		s.data = jQuery.param( s.data, s.traditional );
	}

	// Apply prefilters
	inspectPrefiltersOrTransports( prefilters, s, options, jqXHR );

	// If request was aborted inside a prefilter, stop there
	if ( state === 2 ) {
		return jqXHR;
	}

	// We can fire global events as of now if asked to
	fireGlobals = s.global;

	// Uppercase the type
	s.type = s.type.toUpperCase();

	// Determine if request has content
	s.hasContent = !rnoContent.test( s.type );

	// Watch for a new set of requests
	if ( fireGlobals && jQuery.active++ === 0 ) {
		jQuery.event.trigger( "ajaxStart" );
	}

	// More options handling for requests with no content
	if ( !s.hasContent ) {

		// If data is available, append data to url
		if ( s.data ) {
			s.url += ( rquery.test( s.url ) ? "&" : "?" ) + s.data;
			// #9682: remove data so that it's not used in an eventual retry
			delete s.data;
		}

		// Get ifModifiedKey before adding the anti-cache parameter
		ifModifiedKey = s.url;

		// Add anti-cache in url if needed
		if ( s.cache === false ) {

			var ts = jQuery.now(),
				// try replacing _= if it is there
				ret = s.url.replace( rts, "$1_=" + ts );

			// if nothing was replaced, add timestamp to the end
			s.url = ret + ( ( ret === s.url ) ? ( rquery.test( s.url ) ? "&" : "?" ) + "_=" + ts : "" );
		}
	}

	// Set the correct header, if data is being sent
	if ( s.data && s.hasContent && s.contentType !== false || options.contentType ) {
		jqXHR.setRequestHeader( "Content-Type", s.contentType );
	}

	// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
	if ( s.ifModified ) {
		ifModifiedKey = ifModifiedKey || s.url;
		if ( jQuery.lastModified[ ifModifiedKey ] ) {
			jqXHR.setRequestHeader( "If-Modified-Since", jQuery.lastModified[ ifModifiedKey ] );
		}
		if ( jQuery.etag[ ifModifiedKey ] ) {
			jqXHR.setRequestHeader( "If-None-Match", jQuery.etag[ ifModifiedKey ] );
		}
	}

	// Set the Accepts header for the server, depending on the dataType
	jqXHR.setRequestHeader(
		"Accept",
		s.dataTypes[ 0 ] && s.accepts[ s.dataTypes[0] ] ?
			s.accepts[ s.dataTypes[0] ] + ( s.dataTypes[ 0 ] !== "*" ? ", " + allTypes + "; q=0.01" : "" ) :
			s.accepts[ "*" ]
	);

	// Check for headers option
	for ( i in s.headers ) {
		jqXHR.setRequestHeader( i, s.headers[ i ] );
	}

	// Allow custom headers/mimetypes and early abort
	if ( s.beforeSend && ( s.beforeSend.call( callbackContext, jqXHR, s ) === false || state === 2 ) ) {
			// Abort if not done already and return
			return jqXHR.abort();

	}

	// aborting is no longer a cancellation
	strAbort = "abort";

	// Install callbacks on deferreds
	for ( i in { success: 1, error: 1, complete: 1 } ) {
		jqXHR[ i ]( s[ i ] );
	}

	// Get transport
	transport = inspectPrefiltersOrTransports( transports, s, options, jqXHR );

	// If no transport, we auto-abort
	if ( !transport ) {
		done( -1, "No Transport" );
	} else {
		jqXHR.readyState = 1;
		// Send global event
		if ( fireGlobals ) {
			globalEventContext.trigger( "ajaxSend", [ jqXHR, s ] );
		}
		// Timeout
		if ( s.async && s.timeout > 0 ) {
			timeoutTimer = setTimeout( function(){
				jqXHR.abort( "timeout" );
			}, s.timeout );
		}

		try {
			state = 1;
			transport.send( requestHeaders, done );
		} catch (e) {
			// Propagate exception as error if not done
			if ( state < 2 ) {
				done( -1, e );
			// Simply rethrow otherwise
			} else {
				throw e;
			}
		}
	}

	return jqXHR;
},

// Counter for holding the number of active queries
active: 0,

// Last-Modified header cache for next request
lastModified: {},
etag: {}