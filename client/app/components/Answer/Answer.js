import parse from 'html-react-parser';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';

import './Answer.css';

export default function Answer({content, responses, isBest}) {
    const parsedContent = parse(content);

    return (
        <Typography>
            <Box flexDirection='column' className='answer' fontWeight={isBest ? 'fontWeightBold' : 'regular'} color={isBest ? 'success.main' : 'text.primary'}>
                <Box className='content'>
                    {parsedContent}
                </Box>
                <Box>
                    {responses.length ? ` (${responses.map(x => x.user.name).join(', ')})` : ''}
                </Box>
            </Box>
        </Typography>
    );
};