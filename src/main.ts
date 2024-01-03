import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router/index'
import { NGlobalStyle, NConfigProvider, NLayout, NIcon, 
    NButton, NSpace, NSelect, NPageHeader, NLayoutHeader, NForm, NInput, NFormItem, NCol, NRow, NDialogProvider, NMessageProvider, NDropdown, NLayoutSider, NDialog, NPopselect, NScrollbar} from 'naive-ui';


const app = createApp(App);

app.use(router);

const naiveFormComponents = [ NGlobalStyle, NConfigProvider, NLayout, NIcon, 
            NButton, NSpace, NPageHeader, NSelect, NLayoutHeader,NForm, NInput, NFormItem, NCol, NRow, NDialogProvider, NMessageProvider, NDropdown, NLayoutSider, NDialog, NPopselect, NScrollbar ];
naiveFormComponents.forEach((component) => {
    app.component(`N${component.name}`, component);
});

app.mount('#app');
