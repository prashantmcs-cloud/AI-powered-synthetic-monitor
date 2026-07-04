import { createRoot } from 'react-dom/client';
import { Theme } from '@radix-ui/themes';
import App from './App';

import '@radix-ui/themes/styles.css';

createRoot(document.getElementById('root')!).render(
   <Theme appearance="dark" accentColor="violet" radius="large">
     <App />
   </Theme>
 );