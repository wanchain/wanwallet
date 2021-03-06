/**
Template Controllers

@module Templates
*/

/**
The request account popup window template

@class [template] popupWindows_requestAccount
@constructor
*/

Template['popupWindows_requestAccount'].onRendered(function () {
    this.$('input.account').focus();
    TemplateVar.set('showPassword', false);
    TemplateVar.set('showReminder', false);
    TemplateVar.set('accountLow', false);
    TemplateVar.set('passwordLow', false);
    TemplateVar.set('passwordRepat', false);
});

Template['popupWindows_requestAccount'].helpers({
    'passwordInputType': function () {
        return TemplateVar.get('showPassword') ? 'text' : 'password';
    }
});

Template['popupWindows_requestAccount'].events({
    'click .cancel': function () {
        ipc.send('backendAction_closePopupWindow');
    },

    'click #close-window': function () {
        TemplateVar.set('creating', false);
        ipc.send('backendAction_closePopupWindow');

    },

    'click .reminder': function (e) {
        TemplateVar.set('showReminder', e.currentTarget.checked);
    },

    'click .showPassIco': function () {
        TemplateVar.set('showPassword', !TemplateVar.get('showPassword'));
    },

    'focus .account': function () {
        TemplateVar.set('accountLow', false);
    },

    'input .password-check': function (e, template) {
        var pw = template.find('input.password').value;

        if (pw && pw.length >= 8) {
            var reminder = e.target.value;

            if (reminder === pw) {
                TemplateVar.set('reminderRisk', true);
            }
        }
    },

    'focus .password': function () {
        TemplateVar.set('passwordLow', false);
    },

    'focus .password-repeat': function () {
        TemplateVar.set('passwordRepat', false);
    },

    'submit form': function (e, template) {
        e.preventDefault();
        //cranelv add Account name input 2017-11-14
        var account1 = template.find('input.account').value;
        var pw = template.find('input.password').value;
        var pwRepeat = template.find('input.password-repeat').value;
        var reminder = '';

        if (TemplateVar.get('showReminder')) {
            reminder = template.find('input.password-check').value;
        }

        // ask for password repeat
        // check passwords

        if((!account1) || account1.length< 2){
            // GlobalNotification.warning({
            //     content: "Please provide a longer account name",
            //     duration: 3
            // });
            TemplateVar.set('accountLow', true);
        } else if (!(pw) ||(pw && pw.length < 8)) {
            // GlobalNotification.warning({
            //     content: TAPi18n.__('mist.popupWindows.requestAccount.errors.passwordTooShort'),
            //     duration: 3
            // });
            TemplateVar.set('passwordLow', true);
        } else if ( pw !== pwRepeat) {
            // GlobalNotification.warning({
            //     content: TAPi18n.__('mist.popupWindows.requestAccount.errors.passwordMismatch'),
            //     duration: 3
            // });
            TemplateVar.set('passwordRepat', true);
        }  else if (pw && pw.length >= 8) {

            TemplateVar.set('creating', true);
            TemplateVar.set('created', false);
            web3.personal.newAccount(pwRepeat, function (e, res) {
                if (!e) {
                    var insert = {
                        type: 'account',
                        address: res,
                        name: account1,
                        reminder: reminder
                    };
                    ipc.send('backendAction_windowMessageToOwner', null, insert);
                } else {
                    ipc.send('backendAction_windowMessageToOwner', e);
                }
                TemplateVar.set(template, 'created', true);

                // // notifiy about backing up!
                // alert(TAPi18n.__('mist.popupWindows.requestAccount.backupHint'));

            });

            TemplateVar.set('password-repeat', false);
            template.find('input.account').value = '';
            template.find('input.password-repeat').value = '';
            template.find('input.password').value = '';
            pw = pwRepeat = null;

        }
   }
});
