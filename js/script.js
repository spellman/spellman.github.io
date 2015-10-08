/* Author:  Cort Spellman

*/


$(document).ready(function()
{
/*    
    $('.container_12').css({'background-image' : 'url(\'12_col.gif\')', 'height' : '500px'});
*/


/*======================================================*\
||                                                      ||
||                 JQUERY TOOLS OVERLAY                 ||
||                                                      ||
\*======================================================*/

    $('[rel="#ScheduleOverlay"]').overlay();



/*======================================================*\
||                                                      ||
||        FORM FIELDS DEFAULT TEXT, TIME TO CALL        ||
||                                                      ||
\*======================================================*/

    // Form fields default text
    $('.InputContainer span').click(function()
    {
        $(this).prev('input, textarea').focus();
    });
    
    
    
    $('.InputContainer input, .InputContainer textarea').keydown(function()
    {
        $(this).parent('.InputContainer').addClass('ContainsText');
    });
    
    
    
    $('.InputContainer input, .InputContainer textarea').change(function()
    {
        $(this).parent('.InputContainer').addClass('ContainsText');
    });
    
    
    
    $('.InputContainer input, .InputContainer textarea').blur(function()
    {
        if($.trim($(this).val()) === "")
        {
            $(this).parent('.InputContainer').removeClass('ContainsText');
        }
    });
    
    
    // Time to call
    $(function()
    {
        if($('#PreferredContactPhone:checked').length === 0)
        {
            $('#TimeToCall').hide();
        }
    });
    
    
    
    $('#Form input[name="preferredcontact"]').change(function()
    {
        if($('#PreferredContactPhone').is(':checked'))
        {
            $('#TimeToCall').show();
        }
        else
        {
            $('#TimeToCall').hide();
        }
    });



/*======================================================*\
||                                                      ||
||          FORM VALIDATION AND AJAX SUBMISSION         ||
||                                                      ||
\*======================================================*/

    $('#FormContainer form').submit(function()
    {
        var formId = this.id;
        
        var formData = {};
        formData['FormId'] = formId;
        formData['Name'] = $('#' + formId + ' input[name="realname"]').val();
        formData['Course'] = $('#' + formId + ' input[name="course"]').val();
        formData['Date'] = $('#' + formId + ' input[name="date"]').val();
        formData['Time'] = $('#' + formId + ' input[name="time"]').val();
        formData['Phone'] = $('#' + formId + ' input[name="phone"]').val();
        formData['Email'] = $('#' + formId + ' input[name="email"]').val();
        formData['PreferredContact'] = $('#' + formId + ' input[name="preferredcontact"]:checked').val();
        formData['TimeToCall'] = $('#' + formId + ' select[name="timetocall"]').val();
        formData['Message'] = $('#' + formId + ' textarea[name="message"]').val();
            
        if (formData['PreferredContact'] === undefined)
            formData['PreferredContact'] = '';
         
        if (formData['TimeToCall'] === undefined)
            formData['TimeToCall'] = '';
        
        
        
        $('#' + formId + ' input').removeClass('Error');
        // console.log('submit button clicked on ' + formId);
        var errors = clientSideValidation(formData);

        if (errors.length > 0)
        {
            // client-side validation failed; indicate errors to user;
            for (var i in errors)
            {
                showInputError(formId, errors[i]);
            }
            
            $('#' + formId + ' .Error').first().focus();
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



/*======================================================*\
||                                                      ||
||        SHOW MORE INFORMATION ON SUMMARY CLICK        ||
||                                                      ||
\*======================================================*/

    $('.Summary').click(function()
    {
        showMoreInformation(this.id);
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
    
    // name REQUIRED
    if (!formData['Name'].match(/^\s*[a-zA-Z\040]{2,}\s*$/))
        errors.push('realname');
    
    // course REQUIRED
    if (formData['Course'].length < 4)
        errors.push('course');

    // phone REQUIRED
    if (!formData['Phone'].match(/^([a-zA-Z,#\/ \.\(\)\-\+\*]*[2-9])([a-zA-Z,#\/ \.\(\)\-\+\*]*[0-9]){2}([a-zA-Z,#\/ \.\(\)\-\+\*]*[2-9])([a-zA-Z,#\/ \.\(\)\-\+\*]*[0-9]){6}[0-9a-zA-Z,#\/ \.\(\)\-\+\*]*$/))
        errors.push('phone');
    
    // email REQUIRED
    if (!formData['Email'].match(/^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/))
        errors.push('email');
    
    // preferred contact from radio buttons
    // VERIFY THE VALUE IS ONE I PROVIDED
    if (formData['PreferredContact'] !== '' && formData['PreferredContact'] !== 'Phone' && formData['PreferredContact'] !== 'Email')
        errors.push('preferredcontact');
    
    // preferred time to call from radio buttons
    // VERIFY THE VALUE IS ONE I PROVIDED
    if (formData['TimeToCall'] !== '' && formData['TimeToCall'] !== 'Morning' && formData['TimeToCall'] !== 'Afternoon' && formData['TimeToCall'] !== 'Evening')
        errors.push('timetocall');
    
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
                showInputError(response['FormId'], response['ResponseMessage'][i]);
            }
        }
    }
    else
    {
        // Server-side validation succeeded and email failed or succeeded
        if (response['EmailError'])
            $('#FormContainer').addClass('Error EmailError').html(response['ResponseMessage']);
        else
            $('#FormContainer').addClass('Success').html(response['ResponseMessage']);
    }
}



function ajaxError(request, error)
{
    $('#FormContainer').addClass('Error AjaxError').html('<div><p>Hmmm &mdash; something went wrong with the form. Please call me at 979-436-2192 or email at spellmantutoring@gmail.com and I&#39;ll get you taken care of!</p><p>Sorry the form didn&#39;t work &mdash; I&#39;ll check it out.</p></div>');
    
    // $('#FormContainer').html('Error:<br />' + error);
}



function showInputError(formId, inputName)
{
    // console.log($('#' + formId + ' input[name="' + inputName + '"]').attr('name'));
    $('#' + formId + ' input[name="' + inputName + '"]').addClass('Error');
}



/*======================================================*\
||                                                      ||
||              SHOW INFORMATION FUNCTIONS              ||
||                                                      ||
\*======================================================*/

function showMoreInformation(id)
{
    // Old school for IE7: using body id to store which information
    // is active; update to data-information attribute instead of id
    // when IE7 drops off.
    if($('body').attr('id').length > 0)
    {
        var informationPrevious = $('body').attr('id');
        

        $('#' + informationPrevious + 'Container').hide();
        $('#Summary' + informationPrevious).removeClass('Active');
    }

    var informationMap = {
        'SummaryMethod' : 'Method',
        'SummaryExperience' : 'Experience',
        'SummaryCoursesAndRate' : 'CoursesAndRate',
        'SummaryReviewsAndTwitter' : 'ReviewsAndTwitter'
    };
    var information = informationMap[id];

    $('body').addClass('InformationShowing').attr('id', information);
    $('.Summary').addClass('Inactive');        
    $('#Summary' + information).removeClass('Inactive').addClass('Active');
    $('#' + information + 'Container').show();
    $('#MoreInformation').show();

    scrollToId('Summary');
}



function scrollToId(id)
{
    $('html, body').animate(
    {
        scrollTop: $('#'+id).offset().top
    }, 500);
}
