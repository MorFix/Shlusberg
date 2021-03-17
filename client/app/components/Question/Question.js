import parse from 'html-react-parser';
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import SubQuestion from '../SubQuestion/SubQuestion';
import Answers from '../Answers/Answers';

import './Question.css';

export default function Question({ question }) {
    return (
        <Box className='question'>
            <Accordion defaultExpanded={true}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="h6">
                        {parse(question.content)}
                    </Typography>
                </AccordionSummary>
                <Box display='flex' justifyContent='center' alignItems='center'>
                    <AccordionDetails>
                        <Box display='flex' flexDirection='column'>
                            {
                                question.subQuestions
                                    ? question.subQuestions.map(x => <SubQuestion subQuestion={x} key={x.content} />)
                                    : <Answers question={question} />
                            }
                        </Box>
                    </AccordionDetails>
                </Box>
            </Accordion>
        </Box>
    )
};