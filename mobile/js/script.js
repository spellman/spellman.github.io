/* Author:  Cort Spellman

*/


$(document).ready(function()
{
/*    
    $('.container_12').css({'background-image' : 'url(\'12_col.gif\')', 'height' : '500px'});
*/

$('#PageReviews').live('pagebeforeshow', function(event, ui)
{
    $('[name="viewport"]').attr('content', 'width=652, initial-scale=0.45');
});

$('#PageReviews').live('pagebeforehide', function(event, ui)
{
    $('[name="viewport"]').attr('content', 'width=device-width, initial-scale=1.001');
});



/*======================================================*\
||                                                      ||
||          FORM VALIDATION AND AJAX SUBMISSION         ||
||                                                      ||
\*======================================================*/

    $('#PageForm form').submit(function()
    {
        var formId = this.id;
        
        var formData = {};
        formData['FormId'] = formId;
        formData['Name'] = $('#Name').val();
        formData['Course'] = $('#Course').val();
        formData['Date'] = $('#Date').val();
        formData['Time'] = $('#Time').val();
        formData['Phone'] = $('#Phone').val();
        formData['Email'] = $('#Email').val();
        formData['PreferredContact'] = $('#PreferredContact').val();
        formData['TimeToCall'] = $('#TimeToCall').val();
        formData['Message'] = $('#Message').val();
            
        if (formData['PreferredContact'] === undefined)
            formData['PreferredContact'] = '';
         
        if (formData['TimeToCall'] === undefined)
            formData['TimeToCall'] = '';
        
        
        
        $('input').removeClass('Error');
        // console.log('submit button clicked');
        var errors = clientSideValidation(formData);

        if (errors.length > 0)
        {
            // client-side validation failed; indicate errors to user;
            for (var i in errors)
            {
                showInputError(errors[i]);
            }
            
            $('.Error').first().focus();
        }
        else
        {
            // client-side validation succeeded; submit form to validation
            // and mail script
            scheduleFormAjax(formData)
        }
        
        // Prevent the submit button action (DreamHost script) from being taken
        return false;
    });

}); // END OF $('document').ready();



/*======================================================*\
||                                                      ||
||                    FORM FUNCTIONS                    ||
||                                                      ||
\*======================================================*/

function clientSideValidation(formData)
{
    var errors = [];
    
    // Name REQUIRED
    if (!formData['Name'].match(/^\s*[a-zA-Z\040]{2,}\s*$/))
        errors.push('Name');
    
    // Course REQUIRED
    if (formData['Course'].length < 4)
        errors.push('Course');

    // PhoneNumber REQUIRED
    if (!formData['Phone'].match(/^([a-zA-Z,#\/ \.\(\)\-\+\*]*[2-9])([a-zA-Z,#\/ \.\(\)\-\+\*]*[0-9]){2}([a-zA-Z,#\/ \.\(\)\-\+\*]*[2-9])([a-zA-Z,#\/ \.\(\)\-\+\*]*[0-9]){6}[0-9a-zA-Z,#\/ \.\(\)\-\+\*]*$/))
        errors.push('Phone');
    
    // Email REQUIRED
    if (!formData['Email'].match(/^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/))
        errors.push('Email');
    
    // preferred contact from toggle (select) VERIFY THE VALUE IS ONE I PROVIDED
    if (formData['PreferredContact'] !== 'Phone' && formData['PreferredContact'] !== 'Email')
        errors.push('PreferredContact');
    
    // preferred time to call from select VERIFY THE VALUE IS ONE I PROVIDED
    if (formData['TimeToCall'] !== '' && formData['TimeToCall'] !== 'Morning' && formData['TimeToCall'] !== 'Afternoon' && formData['TimeToCall'] !== 'Evening')
        errors.push('TimeToCall');
    
    return errors;
}



function scheduleFormAjax(formData)
{            
    // client-side validation succeeded; make ajax request
    $.ajax(
    {
        url: "php/schedule-form-to-email.php",
        type: "POST",
        data: JSON.stringify(formData),
        contentType: "application/json; charset=utf-8",
        cache: false,
        dataType: "json",
        success: ajaxSuccess,
        error: ajaxError
    });
}



function ajaxSuccess(response)
{
    // console.log(response);
    
    if (response['FormDataError'])
    {
        if (response['FormId'] !== 'Form')
        {
            // FormId incorrect--why?
            $('#FormContainer').addClass('Error FormIdError').html(response['ResponseMessage']);
        }
        else
        {
            // server-side validation failed - indicate errors to user
            for (var i in response['ResponseMessage'])
            {
                showInputError(response['ResponseMessage'][i]);
            }
        }
    }
    else
    {
        // Server-side validation succeeded and email failed or succeeded
        if (response['EmailError'])
            $('#PageForm div[data-role="content"]').addClass('Error EmailError').html(response['ResponseMessage']);
        else
            $('#PageForm div[data-role="content"]').addClass('Success').html(response['ResponseMessage']);
    }
}



function ajaxError(request, error)
{
    $('#PageForm div[data-role="content"]').addClass('Error AjaxError').html('<div><p>Hmmm &mdash; something went wrong with the form. Please call me at 979-436-2192 or email at spellmantutoring@gmail.com and I&#39;ll get you taken care of!</p><p>Sorry the form didn&#39;t work&mdash;I&#39;ll check it out.</p></div>');
    
    // $('#FormContainer').html('Error:<br />' + error);
}



function showInputError(inputName)
{
    // console.log(inputName);
    $('#' + inputName).addClass('Error');
}
