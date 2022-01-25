import { useCallback, useEffect, useState } from 'react';

import createMuiTheme from '@material-ui/core/styles/createMuiTheme';
import CssBaseline from "@material-ui/core/CssBaseline";
import FormControl from "@material-ui/core/FormControl";
import FilledInput from "@material-ui/core/FilledInput";
import InputAdornment from "@material-ui/core/InputAdornment";
import IconButton from "@material-ui/core/IconButton";
import Visibility from "@material-ui/icons/Visibility";
import VisibilityOff from "@material-ui/icons/VisibilityOff";

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

const KEY_LOCALSTORAGE_SLOT = 'key';

export default function App() {
    const [key, setKey] = useState('');
    const [showKey, setShowKey] = useState(false);
    const [responses, setResponses] = useState([]);

    const init = useCallback(() => {
        fetch(`/response?key=${key}`)
            .then(res => res.json().then(json => Promise[res.ok ? 'resolve' : 'reject'](json)))
            .then(setResponses)
            .catch(e => console.log(e))
    });

    useEffect(() => {
        init();
        const intervalId = setInterval(init, 4000);

        return () => {
            clearInterval(intervalId);
        }
    }, [key]);

    useEffect(() => {
        setKey(localStorage.getItem(KEY_LOCALSTORAGE_SLOT) || '');
    }, []);

    const onKeyChange = event => {
        const newKey = event.target.value;

        setKey(newKey);
        localStorage.setItem(KEY_LOCALSTORAGE_SLOT, newKey);
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <FormControl sx={{ m: 1, width: '25ch' }} variant="outlined">
                <FilledInput id="key" type={showKey ? 'text' : 'password'} value={key} onChange={onKeyChange} label="Key"
                    endAdornment={
                        <InputAdornment position="end">
                            <IconButton onClick={() => setShowKey(x => !x)} edge="end">
                                {showKey ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                        </InputAdornment>
                    }/>
            </FormControl>
            <Responses responses={responses} />
        </ThemeProvider>
    );
};