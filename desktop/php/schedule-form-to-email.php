<?php

date_default_timezone_set('America/Chicago');

/*
ini_set('display_errors', 'On');
error_reporting(E_ALL);
error_reporting(E_ALL | E_STRICT);
*/

// phpmailer
require_once('mylibs/phpmailer/class.phpmailer.php');


// Receive form data from jQuery ajax post
//$data = json_decode($_POST['formData'], true);
$jsonRequest = file_get_contents('php://input');
$data = json_decode($jsonRequest, true);
/*
echo 'var_dump($data):'."\n";
var_dump($data);
echo "\n";
*/

/*======================================================*\
||                                                      ||
||            FORM VALIDATION AND SANITIZATION          ||
||                                                      ||
\*======================================================*/

// check FormId
$data['FormId'] = filter_var($data['FormId'], FILTER_SANITIZE_STRING);
if($data['FormId'] !== 'Form')
{
    $response['FormDataError'] = true;
    $response['EmailError'] = false;
    $response['FormId'] = $data['FormId'];
    $response['ResponseMessage'] = '<div><p class="Failure FormIdFailure">Hmmm &mdash; something went wrong with the form. Please call me at 979-436-2192 or email at spellmantutoring@gmail.com and I&#39;ll get you taken care of!</p><p>Sorry the form didn&#39;t work&mdash;I&#39;ll check it out.</p></div>';
}
else
{
    // FormId ok
    
    $errors = array();
    
    // name REQUIRED
    $data['Name'] = filter_var($data['Name'], FILTER_SANITIZE_STRING);
    if (strlen($data['Name']) < 2)
        $errors[] = 'realname';
    
    // course REQUIRED
    $data['Course'] = filter_var($data['Course'], FILTER_SANITIZE_STRING);
    if (strlen($data['Course']) < 4)
        $errors[] = 'course';
    
    // date
    $data['Date'] = filter_var($data['Date'], FILTER_SANITIZE_STRING);
    
    // time
    $data['Time'] = filter_var($data['Time'], FILTER_SANITIZE_STRING);

    // message
    $data['Message'] = filter_var($data['Message'], FILTER_SANITIZE_STRING);
    
    // phone REQUIRED
    if (filter_var($data['Phone'], FILTER_VALIDATE_REGEXP, array('options' => array('regexp' => '/^([a-zA-Z,#\/ \.\(\)\-\+\*]*[2-9])([a-zA-Z,#\/ \.\(\)\-\+\*]*[0-9]){2}([a-zA-Z,#\/ \.\(\)\-\+\*]*[2-9])([a-zA-Z,#\/ \.\(\)\-\+\*]*[0-9]){6}[0-9a-zA-Z,#\/ \.\(\)\-\+\*]*$/'))) === false)
        $errors[] = 'phone';
    
    // email REQUIRED
    if (filter_var($data['Email'], FILTER_VALIDATE_EMAIL) === false)
        $errors[] = 'email';
    
    // preferred contact from radio buttons VERIFY THE VALUE IS ONE I PROVIDED
    if ($data['PreferredContact'] !== '' && $data['PreferredContact'] !== 'Phone' && $data['PreferredContact'] !== 'Email')
        $errors[] = 'preferredcontact';
    
    // preferred time to call from radio buttons VERIFY THE VALUE IS ONE I PROVIDED
    if ($data['TimeToCall'] !== '' && $data['TimeToCall'] !== 'Morning' && $data['TimeToCall'] !== 'Afternoon' && $data['TimeToCall'] !== 'Evening')
        $errors[] = 'timetocall';
            
    /*
    echo 'var_dump($data):'."\n";
    var_dump($data);
    echo "\n";
    */
    
    
    /*======================================================*\
    ||                                                      ||
    ||     ALERT USER TO ERRORS; SEND EMAIL IF NO ERRORS    ||
    ||                                                      ||
    \*======================================================*/
    
    if (count($errors) > 0)
    {
        $response['FormDataError'] = true;
        $response['EmailError'] = false;
        $response['FormId'] = $data['FormId'];
        $response['ResponseMessage'] = $errors;
    }
    else
    {
        // no errors; build email and send
        $bodyContent = 'Name: '.$data['Name'].'<br />';
        $bodyContent .= 'Course: '.$data['Course'].'<br />';
        $bodyContent .= 'Preferred date: '.$data['Date'].'<br />';
        $bodyContent .= 'Preferred time: '.$data['Time'].'<br />';
        $bodyContent .= 'Phone: '.$data['Phone'].'<br />';
        $bodyContent .= 'Email: '.$data['Email'].'<br />';
        $bodyContent .= 'Preferred contact: '.$data['PreferredContact'].'<br />';
        if ($data['PreferredContact'] === 'Phone')
            $bodyContent .= 'Preferred time to call: '.$data['TimeToCall'].'<br />';
        $bodyContent .= 'Message:'.'<br />&nbsp;<br />'.$data['Message'];
    
    
    /*
    echo 'var_dump($bodyContent):'."\n";
    var_dump($bodyContent);
    echo "\n";
    */
    
    
        // Create the message
        $mail = new PHPMailer();
        $mail->IsSMTP();  // telling the class to use SMTP
        $mail->Host     = 'mail.spellmantutoring.com'; // SMTP server
        $mail->SMTPSecure = "tls";
        $mail->Port     = 587;
        $mail->Username = 'scheduling@spellmantutoring.com';
        $mail->Password = 'fQwHyjEE';
        $mail->SMTPAuth = 'true';
        $mail->Sender   = 'scheduling@spellmantutoring.com';
        $mail->SetFrom('scheduling@spellmantutoring.com', $data['Name']);
        $mail->ClearReplyTos();
        $mail->AddReplyTo($data['Email'], $data['Name']);
    
    
    
        $mail->AddAddress('spellmantutoring@gmail.com', 'Spellman Tutoring');
        $mail->Subject  = 'Contact form: '.$data['Name'];
    
    
    
        $mail->IsHTML(true);
        $mail->Body     = $bodyContent;
        $mail->AltBody  = $bodyContent;
        $mail->WordWrap = 50;
    
    
    
        // Send the message.
        if(!$mail->Send())
        {
            //	echo 'Message was not sent.';
            //	echo 'Mailer error: ' . $mail->ErrorInfo;
            
            // set failure message
            $response['FormDataError'] = false;
            $response['EmailError'] = true;
            $response['FormId'] = $data['FormId'];
            $response['ResponseMessage'] = '<div><p>Hmmm&mdash;something went wrong with the form. Please call me at 979-217-1517 and I&#39;ll get you taken care of!</p><p>Sorry the form didn&#39;t work&mdash;I&#39;ll check it out.</p></div>';
        }
        else
        {
            // set success message
            $response['FormDataError'] = false;
            $response['EmailError'] = false;
            $response['FormId'] = $data['FormId'];
            $response['ResponseMessage'] = '<div><h2>Thank you!</h2><p>Your message was sent and<br />I&#39;ll contact you to set things up within 24 hours.</p></div>';
        }
    }
}
/*
echo 'var_dump($response):'."\n";
var_dump($response);
echo "\n";
*/
echo json_encode($response);
