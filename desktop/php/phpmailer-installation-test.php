<?php

// test phpmailer installation

ini_set('display_errors', 'On');
error_reporting(E_ALL);
error_reporting(E_ALL | E_STRICT);

date_default_timezone_set('America/Chicago');

require_once('mylibs/phpmailer/class.phpmailer.php');


$mail = new PHPMailer();

$mail->IsSMTP();  // telling the class to use SMTP

$mail->Host     = 'mail.spellmantutoring.com'; // SMTP server

$mail->SMTPSecure = "tls";

$mail->Port     = 587;

$mail->Username = 'scheduling@spellmantutoring.com';

$mail->Password = 'fQwHyjEE';

$mail->SMTPAuth = 'true';

//$mail->Sender   = ('scheduling@spellmantutoring.com', 'no-reply');

$mail->SetFrom('scheduling@spellmantutoring.com', 'no-reply');

$mail->ClearReplyTos();

$mail->AddReplyTo('spellmantutoring@gmail.com', 'Spellman Tutoring');



$mail->AddAddress('spellmantutoring@gmail.com', 'Cort Spellman');

$mail->Subject  = 'First PHPMailer Message';



$mail->IsHTML(true);

$mail->Body     = 'Hello, <b>my friend</b>! <br /> This message uses HTML entities&mdash;yeah!';

$mail->AltBody  = 'Hi! \n\n This is my first e-mail sent through PHPMailer. \n\n Plain text, son!';

$mail->WordWrap = 50;



if(!$mail->Send())
{
	echo 'Message was not sent.';
	echo 'Mailer error: ' . $mail->ErrorInfo;
}
else
{
	echo 'Message has been sent.';
}