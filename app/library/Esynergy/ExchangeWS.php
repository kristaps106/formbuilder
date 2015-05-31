<?php

namespace Esynergy;
use PhpEws\EWSType\CreateAttachmentType;
use PhpEws\EWSType\FileAttachmentType;
use PhpEws\ExchangeWebServices;
use PhpEws\EWSType\FindItemType;
use PhpEws\EWSType\ItemResponseShapeType;
use PhpEws\EWSType\DefaultShapeNamesType;
use PhpEws\EWSType\ItemQueryTraversalType;
use PhpEws\EWSType\IndexedPageViewType;
use PhpEws\EWSType\NonEmptyArrayOfBaseFolderIdsType;
use PhpEws\EWSType\DistinguishedFolderIdType;
use PhpEws\EWSType\DistinguishedFolderIdNameType;
use PhpEws\EWSType\NonEmptyArrayOfFieldOrdersType;
use PhpEws\EWSType\FieldOrderType;

use PhpEws\EWSType\ItemIdType;
use PhpEws\EWSType\GetItemType;
use PhpEws\EWSType\BodyTypeResponseType;
use PhpEws\EWSType\PathToUnindexedFieldType;
use PhpEws\EWSType\NonEmptyArrayOfPathsToElementType;
use PhpEws\EWSType\NonEmptyArrayOfBaseItemIdsType;
use PhpEws\EWSType\GetAttachmentType;
use PhpEws\EWSType\NonEmptyArrayOfAttachmentsType;
use PhpEws\EWSType\TargetFolderIdType;
use PhpEws\EWSType\SendItemType;

use PhpEws\EWSType\MessageType;
use PhpEws\EWSType\EmailAddressType;
use PhpEws\EWSType\SingleRecipientType;
use PhpEws\EWSType\BodyType;
use PhpEws\EWSType\CreateItemType;
use PhpEws\EWSType\NonEmptyArrayOfAllItemsType;

use PhpEws\EWSType\ResolveNamesType;

use PhpEws\EWSType\ConstantValueType;
use PhpEws\EWSType\RestrictionType;
use PhpEws\EWSType\ContainsExpressionType;

class ExchangeWS {

	public $pagination_page_items = 100;
	// path to directory where store embeded images
	public $temp_folder = 'temp';
	protected $ews;
	protected $mailboxes = [
		'INBOX' => DistinguishedFolderIdNameType::INBOX,
		'SENT'  => DistinguishedFolderIdNameType::SENT_ITEMS
	];

	public function __construct($host, $username, $password, $version=null) {
		if($version === null)
			$version = \Config::get('activedirectory.ews_version', ExchangeWebServices::VERSION_2010_SP2);

		$this->ews = new ExchangeWebServices($host, $username, $password, $version);
	}


	/**
	 * query exchange for emails with specificed category label
     *
     * @param string $category_label
     * @param string $folder
     * @return object
	 */
	public function getByCategory( $category_label, $folder = 'sent' )
	{
		$Restrictions = new RestrictionType;
		$Restrictions->IsEqualTo = (object)[
			'FieldURI'              => (object)[
				  'FieldURI' => 'item:Categories'
			  ],
			'FieldURIOrConstant'    => (object)[ 'Constant' => (object)[ 'Value' => $category_label ] ]
		];
		return $this->getEmailsList( $folder, 0, $Restrictions );
	}

    /**
     * query exchange for emails using restriction filter
     *
     * @param string $folder
     * @param int $page
     * @param RestrictionType|null $restriction
     * @return object
     */
	public function     getEmailsList( $folder, $page = 0, $restriction = NULL )
	{
		$folder = strtoupper( $folder );
		$Folder = isset( $this->mailboxes[ $folder ] ) ? $this->mailboxes[ $folder ] : reset ( $this->mailboxes );
		$request = new FindItemType;
		$request->ItemShape = new ItemResponseShapeType;
		$request->ItemShape->BaseShape = DefaultShapeNamesType::DEFAULT_PROPERTIES;
		$request->Traversal = ItemQueryTraversalType::SHALLOW;
// Limits the number of items retrieved
		$request->IndexedPageItemView = new IndexedPageViewType;
		$request->IndexedPageItemView->BasePoint = "Beginning";
// Item number you want to start at
		$request->IndexedPageItemView->Offset = $page * $this->pagination_page_items;
// Numer of items to return in total
		$request->IndexedPageItemView->MaxEntriesReturned = $this->pagination_page_items;
		$request->ParentFolderIds = new NonEmptyArrayOfBaseFolderIdsType;
		$request->ParentFolderIds->DistinguishedFolderId = new DistinguishedFolderIdType;
		$request->ParentFolderIds->DistinguishedFolderId->Id = $Folder;
// sort order
		$request->SortOrder = new NonEmptyArrayOfFieldOrdersType;
		$request->SortOrder->FieldOrder = [];
		$order = new FieldOrderType;
// sorts mails so that oldest appear first
// more field uri definitions can be found from types.xsd (look for UnindexedFieldURIType)
		$order->FieldURI = new \stdClass;
		$order->FieldURI->FieldURI = 'item:DateTimeReceived';
		$order->Order = 'Descending';
		$request->SortOrder->FieldOrder[] = $order;

		// apply restriction for item search
		if ( $restriction  && $restriction instanceof RestrictionType )
		{
			$request->Restriction = $restriction;
		} else {
			die('ups');
		}

		$response = $this->ews->FindItem($request);
		if( ! isset( $response->ResponseMessages->FindItemResponseMessage->RootFolder ) )
		{
			$responseMessage = $response->ResponseMessages->FindItemResponseMessage;
			return [
				'error'     => TRUE,
				'message'   => $responseMessage->MessageText,
				'code'      => $responseMessage->ResponseCode
			];
		}

		$rootFolder = $response->ResponseMessages->FindItemResponseMessage->RootFolder;
		//$just_these = array_fill_keys( explode( ',', 'ItemId,Subject,' ), '' );
		if ( empty ( $rootFolder->Items->Message ) )
		{
			// no messages found
			return [
				'page'      => $page,
				'total'     => 0,
				'messages'  => []
			];
		}
		$messages = !empty( $rootFolder->Items->Message->ItemId ) ? [ $rootFolder->Items->Message ] : $rootFolder->Items->Message;

		return [
			'page'      => $page,
			'total'     => ceil( $response->ResponseMessages->FindItemResponseMessage->RootFolder->TotalItemsInView / $this->pagination_page_items ),
			'messages'  => $messages
		];
	}

	/**
	 * get email body by message id
	 *
	 * @param string $message_id exchange email message id
	 * @return object
	 */
	public function     getEmailById( $message_id )
	{
		// Build the request for the parts.
		$request = new GetItemType;
		$request->ItemShape = new ItemResponseShapeType;
		$request->ItemShape->BaseShape = DefaultShapeNamesType::ALL_PROPERTIES;
// You can get the body as HTML, text or "best".
		$request->ItemShape->BodyType = BodyTypeResponseType::HTML;
// Add the body property.
		$body_property = new PathToUnindexedFieldType;
		$body_property->FieldURI = 'item:Body';
		$request->ItemShape->AdditionalProperties = new NonEmptyArrayOfPathsToElementType();
		$request->ItemShape->AdditionalProperties->FieldURI = [
			$body_property,
		];
		$request->ItemIds = new NonEmptyArrayOfBaseItemIdsType;
		$request->ItemIds->ItemId = [];
// Add the message to the request.
		$message_item = new ItemIdType;
		$message_item->Id = $message_id;
		$request->ItemIds = new \stdClass;
		$request->ItemIds->ItemId[] = $message_item;
		$response = $this->ews->GetItem( $request );
		return $response->ResponseMessages->GetItemResponseMessage->Items->Message;
	}

	/**
	 * get email attachments
     *
	 * @param string $message_id exchange email message id
	 * @param bool $ignore_embedded ignore embedded images
	 * @return  array
	 */
	public function     getEmailAttachments( $message_id, $ignore_embedded = TRUE )
	{
		$request = new GetItemType;
		$request->ItemShape = new ItemResponseShapeType;
		$request->ItemShape->BaseShape = DefaultShapeNamesType::ALL_PROPERTIES;
		$request->ItemIds = new NonEmptyArrayOfBaseItemIdsType;
		$request->ItemIds->ItemId = new ItemIdType;
		$request->ItemIds->ItemId->Id = $message_id;
		$response = $this->ews->GetItem($request);
		if ( $response->ResponseMessages->GetItemResponseMessage->ResponseClass != 'Success' )
		{
			return NULL;
		}
		$message = $response->ResponseMessages->GetItemResponseMessage->Items->Message;
		if ( empty($message->Attachments->FileAttachment) )
		{
			// No attachments found
			return [];
		}
		$attachments = is_array( $message->Attachments->FileAttachment ) ?
		    $message->Attachments->FileAttachment : [ $message->Attachments->FileAttachment ];
		$files = [];
		$request = new GetAttachmentType;
		$request->AttachmentIds = new \stdClass;
		foreach( $attachments as $index => $attachment )
		{
			if ( $ignore_embedded && $attachment->IsInline )
			{
				continue;
			}
			$request->AttachmentIds->AttachmentId = $attachment->AttachmentId;
			$response = $this->ews->GetAttachment( $request );
			// TODO: add request response validation!!!
			// Assuming response was successful ...
			$data = $response->ResponseMessages->GetAttachmentResponseMessage->Attachments;
			$file = array_intersect_key( (array)$data->FileAttachment, array_fill_keys(['Name','ContentType','ContentId','Content'], '') );
			$file['AttachmentId'] = $data->FileAttachment->AttachmentId->Id;
			// not sure but looks like this detection works
			$file['Embedded'] = $attachment->IsInline || $attachment->IsContactPhoto;
			$filename = implode( '_', [
				base_convert( microtime(), 10, 30 ),
				base_convert( $index + rand(1, 512), 10, 30 ),
				$file['Name']
			] );
			$file['FileName'] = $file['Embedded'] ? public_path( $this->temp_folder .DIRECTORY_SEPARATOR. $filename )
			    : \FileDocument::getPathToFile( $filename );
			file_put_contents( $file['FileName'], $file['Content'] );
			unset( $file['Content'] );
			$files[] = $file;
		}
		return $files;
	}

	/**
	 * send email
     *
	 * @param string $from
	 * @param string $to
	 * @param string $subject
	 * @param string $body
     * @param array|null $attachments
     * @return object
	 */
	public function     sendEmail( $from, $to, $subject, $body, $attachments = NULL )
	{
		$message = new MessageType;

		$to = is_array( $to ) ? $to : [ [ 'Email' => $to ] ];
		foreach( $to as $recipient )
		{
			$email = new EmailAddressType;
			$email->EmailAddress = isset( $recipient[ 'Email' ] ) ? $recipient[ 'Email' ] : reset( $recipient );
			if ( isset( $recipient[ 'Name' ] ) )
			{
				$email->Name = $recipient[ 'Name' ];
			}
			$message->ToRecipients[] = $email;
		}
		$from = is_array( $from ) ? $from : [ 'Email' => $from ];
		$fromAddress = new EmailAddressType;
		$fromAddress->EmailAddress = isset( $from[ 'Email' ] ) ? $from[ 'Email' ] : reset( $from );
		if ( isset( $from[ 'Name' ] ) )
		{
			$fromAddress->Name = $from[ 'Name' ];
		}
		$message->From = new SingleRecipientType;
		$message->From->Mailbox = $fromAddress;
		$message->Subject = $subject;
		$message->Body = new BodyType;
		$message->Body->BodyType = 'HTML';
		$message->Body->_ = $body;

		$msgRequest = new CreateItemType;
		$msgRequest->Items = new NonEmptyArrayOfAllItemsType;
		$msgRequest->Items->Message = $message;
		if ( empty( $attachments ) )
		{
			$msgRequest->MessageDisposition = 'SendAndSaveCopy';
			$msgRequest->MessageDispositionSpecified = TRUE;
			return $this->ews->CreateItem( $msgRequest );
		}
		$files = [];
		foreach( $attachments as $attachment )
		{
			$file = new FileAttachmentType;
			$file->Content = file_get_contents( $attachment['path'] );
			$file->Name = $attachment['name'];
			$file->ContentType = 'binary/octet-stream';
			$files[] = $file;
		}
		$msgRequest->MessageDisposition = 'SaveOnly';
		$msgRequest->MessageDispositionSpecified = TRUE;
		$response = $this->ews->CreateItem( $msgRequest );

		$attRequest = new CreateAttachmentType();
		$attRequest->ParentItemId = $response->ResponseMessages->CreateItemResponseMessage->Items->Message->ItemId;
		$attRequest->Attachments = new NonEmptyArrayOfAttachmentsType;
		$attRequest->Attachments->FileAttachment = $files;
		$attResponse = $this->ews->CreateAttachment($attRequest);

		if ( count( $files ) > 1 && is_array( $attResponse->ResponseMessages->CreateAttachmentResponseMessage ) )
		{
			$shortcut = end( $attResponse->ResponseMessages->CreateAttachmentResponseMessage );
		} else {
			$shortcut = $attResponse->ResponseMessages->CreateAttachmentResponseMessage;
		}
		$attResponseId = $shortcut->Attachments->FileAttachment->AttachmentId;

		// Save message id from create attachment response
		$msgItemId = new ItemIdType();
		$msgItemId->ChangeKey = $attResponseId->RootItemChangeKey;
		$msgItemId->Id = $attResponseId->RootItemId;

		// Send and save message
		$msgSendRequest = new SendItemType;
		$msgSendRequest->ItemIds = new NonEmptyArrayOfBaseItemIdsType;
		$msgSendRequest->ItemIds->ItemId = $msgItemId;
		$msgSendRequest->SavedItemFolderId = new TargetFolderIdType;
		$sentItemsFolder = new DistinguishedFolderIdType;
		$sentItemsFolder->Id = 'sentitems';
		$msgSendRequest->SavedItemFolderId->DistinguishedFolderId = $sentItemsFolder;
		$msgSendRequest->SaveItemToFolder = TRUE;

		return $this->ews->SendItem($msgSendRequest);
	}

	// exchange path to email lookup example:
	//https://code.google.com/p/php-ews/wiki/CreateContact
	public function     getContactsList()
	{
		/*
		$request = new FindItemType;

		$request->ItemShape = new ItemResponseShapeType;
		$request->ItemShape->BaseShape = DefaultShapeNamesType::ALL_PROPERTIES;

		$request->ContactsView = new ContactsViewType;
		$request->ContactsView->InitialName = 'a';
		$request->ContactsView->FinalName = 'z';

		$request->ParentFolderIds = new NonEmptyArrayOfBaseFolderIdsType;
		$request->ParentFolderIds->DistinguishedFolderId = new DistinguishedFolderIdType;
		$request->ParentFolderIds->DistinguishedFolderId->Id = DistinguishedFolderIdNameType::CONTACTS;

		$request->Traversal = ItemQueryTraversalType::SHALLOW;

		$response = $this->ews->FindItem($request);
		echo '<pre>'.print_r($response, true).'</pre>';
		*/
	}

	public function     getMailbox( $mailbox )
	{
		if ( empty( $mailbox->Mailbox ) )
		{
			throw new \Exception('Can not parse mailbox');
		}
		if ( $mailbox->Mailbox instanceof \stdClass )
		{
			$mailbox->Mailbox = [ $mailbox->Mailbox ];
		}
		$emails = [];
		foreach( $mailbox->Mailbox as $item )
		{
			if ( $item->RoutingType == 'EX' )
			{
				$item = $this->resolveEmailAddress( $item->EmailAddress );
				if ( is_null( $item ) )
				{
					continue;
				}
			}
			$email = $item->EmailAddress;
			$emails[ $email ] = $item->Name;
		}
		return $emails;
	}

	public function     resolveEmailAddress( $email_string )
	{
		$email = NULL;
		$request = new ResolveNamesType;
		$request->UnresolvedEntry = $email_string;
		$request->ReturnFullContactData = TRUE;
		$response = $this->ews->ResolveNames( $request );
		$response = $response->ResponseMessages->ResolveNamesResponseMessage;
		if ( ! empty( $response->ResolutionSet ) )
		{
			$email = $response->ResolutionSet->Resolution->Mailbox;
		}
		return $email;
	}

}