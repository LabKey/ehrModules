import '../../../resources/web/ehr/panel/AnimalDetailsPanel.js'

let animalDetail;

function panelWithSecurity() {
    animalDetail = Ext4.create('EHR.panel.AnimalDetailsPanel', {
        renderTo: 'extjs-panel-with-react'
    });
}

export function renderAnimalDetailsPanel() {

    EHR.Security.init({
        scope: this,
        success: panelWithSecurity
    });

}

export function updateAnimalId(id) {
    animalDetail.fireEvent('animalchange', id);
}