import { useCallback, useEffect, useState } from 'react';

import createMuiTheme from '@material-ui/core/styles/createMuiTheme';
import CssBaseline from "@material-ui/core/CssBaseline";
import ThemeProvider from '@material-ui/styles/ThemeProvider';

import Responses from './Responses/Responses';

import './App.css';

const theme = createMuiTheme({
    direction: 'rtl',
    palette: {
        background: {
            default: '#f3f3f3'
        }
    }
});

export default function App() {
    const [responses, setResponses] = useState([]);

    const init = useCallback(() => {
        fetch('/response')
            .then(res => res.json())
            .then(setResponses)
    });

    useEffect(() => {
        init();
        const intervalId = setInterval(init, 4000);

        return () => {
            clearInterval(intervalId);
        }
    }, []);

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Responses responses={responses} />
        </ThemeProvider>
    );
};