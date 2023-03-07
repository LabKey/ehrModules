import '../../../resources/web/ehr/window/RecordDuplicatorWindow.js'

let duplicateWindow;

function windowWithSecurity(onSubmit) {
    duplicateWindow = Ext4.create('EHR.window.RecordDuplicatorWindow', {
        onSubmit: onSubmit
    }).show();
}

export function renderDuplicateWindow(onSubmit) {

    Ext4.onReady(function () {
        EHR.Security.init({
            scope: this,
            success: () => windowWithSecurity(onSubmit)
        });
    });

}