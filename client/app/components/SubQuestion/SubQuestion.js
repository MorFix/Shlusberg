import parse from 'html-react-parser';

import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import Answers from '../Answers/Answers';

const SubQuestion = ({ subQuestion }) => {
    const content = parse(subQuestion.content);

    return (
        <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>{content}</Typography>
            </AccordionSummary>
            <Box display='flex' justifyContent='center' alignItems='center'>
                <AccordionDetails>
                    <Box diplay='flex' flexDirection='column'>
                        {
                            subQuestion.subQuestions
                                ? question.subQuestions.map(x => <SubQuestion subQuestion={x} key={x.content} />)
                                : <Answers question={subQuestion} />
                        }
                    </Box>
                </AccordionDetails>
            </Box>
        </Accordion>
    )
};

export default SubQuestion;