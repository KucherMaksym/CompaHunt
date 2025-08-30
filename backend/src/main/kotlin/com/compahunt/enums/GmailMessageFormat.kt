package com.compahunt.enums


// Reference: https://developers.google.com/workspace/gmail/api/reference/rest/v1/Format
enum class GmailMessageFormat(val value: String) {
    /**
     * Returns only email message ID and labels; does not return the email headers, body, or payload.
     */
    MINIMAL("minimal"),
    /*
     * Returns the full email message data with body content parsed in the payload field; the raw
     * field is not used. Format cannot be used when accessing the api using the gmail.metadata scope.
     */
    FULL("full"),
    /*
     * //Returns the full email message data with body content in the raw field as a base64url encoded string;
     * the payload field is not used. Format cannot be used when accessing the api using the gmail.metadata scope.
     */
    RAW("raw"),
    /*
     * Returns only email message ID, labels, and email headers.
     */
    METADATA("metadata"),
}