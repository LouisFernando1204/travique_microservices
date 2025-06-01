package constant

type Error string

const (

	FailedToParseData					Error = "Oops! We encountered an issue while processing your data. Please try again!"
	FailedToHashPassword				Error = "We ran into an error while securing your password. Please try again!"
	FailedToInsertData      			Error = "Sorry, we couldn’t add the new data. Please try again!"
	FailedToLoadUserData    			Error = "We couldn’t load your account information. Please try again!"
	FailedToUpdateData           		Error = "We couldn’t update the data. Please give it another shot!"
	FailedToGenerateTokenAccess  		Error = "We couldn’t generate an access token. Please try again!"
	InvalidAccountError          		Error = "The email or password entered is incorrect. Please try again!"
	InvalidTokenError            		Error = "The token provided is invalid. Please try again!"
	DuplicateDataError					Error = "This email is already taken. Please choose another one!"
	PermissionDeniedError        		Error = "Access denied! You don’t have permission to access this data."
	ValidationError              		Error = "Your input doesn’t meet the requirements. Please check and try again!"
	DatabaseNotInitialized				Error = "MongoDB hasn’t been initialized or connected properly. Please check the database setup."
	ErrorLoadEnv						Error = "Failed to load environment variables. Please verify your .env file and restart the application."
	ErrorWhileConnectToDatabase 		Error = "Failed to connect to the MongoDB database. Please check your connection settings."
	ErrorWhilePingToDatabase    		Error = "Unable to reach the MongoDB database. Please ensure it is running and accessible."
	ErrorWhileDisconnectFromDatabase 	Error = "Failed to disconnect from the MongoDB database. Please check the connection state."

)