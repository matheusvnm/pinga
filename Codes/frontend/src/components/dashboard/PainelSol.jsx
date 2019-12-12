import React, { useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios'
import _ from "lodash"
import { lighten, makeStyles } from '@material-ui/core/styles';
import {
    Table, TableBody, TableCell, TableHead, TablePagination, TableRow, TableSortLabel, Toolbar,
    Typography, Paper, IconButton, Tooltip, Grid, CardContent, Modal, FormControl, InputLabel,
    Button, Select,Zoom, MenuItem, TextField, Chip, Avatar, Dialog, DialogActions, DialogTitle, Radio,
    RadioGroup, FormControlLabel, FormLabel, Fab, Divider  
} from '@material-ui/core';
import { Warning as WarningIcon } from '@material-ui/icons'
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns'
import DeleteIcon from '@material-ui/icons/Delete';
import AddIcon from '@material-ui/icons/Add';
import PostAddIcon from '@material-ui/icons/PostAdd';
import HighlightOffIcon from '@material-ui/icons/HighlightOff'
import VisibilityIcon from '@material-ui/icons/Visibility';
import GetAppIcon from '@material-ui/icons/GetApp'
import { UserContext } from '../../context/UserContext'
import { validateName, validateRegistration, validateDate, validateStartEnd, getGroups, getActivities } from '../../scripts/scripts'
import './styles.css'

function getModalStyle() {
    const top = 50
    const left = 50

    return {
        top: `${top}%`,
        left: `${left}%`,
        transform: `translate(-${top}%, -${left}%)`,
        minWidth: '55%',
        maxHeight: '90%',
        overflow:'scroll',
    };
}

function desc(a, b, orderBy) {
    if (b[orderBy] < a[orderBy]) {
        return -1;
    }
    if (b[orderBy] > a[orderBy]) {
        return 1;
    }
    return 0;
}

function stableSort(array, cmp) {
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
        const order = cmp(a[0], b[0]);
        if (order !== 0) return order;
        return a[1] - b[1];
    });
    return stabilizedThis.map(el => el[0]);
}

function getSorting(order, orderBy) {
    return order === 'desc' ? (a, b) => desc(a, b, orderBy) : (a, b) => -desc(a, b, orderBy);
}

const headCells = [
    { id: 'aluno', numeric: false, align: 'left', disablePadding: true, label: 'Aluno' },
    { id: 'atividade', numeric: false, align: 'left', disablePadding: false, label: 'Atividade' },
    { id: 'grupo', numeric: false, align: 'left', disablePadding: false, label: 'Grupo' },
    { id: 'data', numeric: true, align: 'left', disablePadding: false, label: 'Data' },
    { id: 'status', numeric: false, align: 'left', disablePadding: false, label: 'Situação' },
    { id: 'actions', numeric: false, align: 'center', disablePadding: false, label: 'Ações' },
];

function EnhancedTableHead(props) {
    const { classes, order, orderBy, onRequestSort } = props;
    const createSortHandler = property => event => {
        onRequestSort(event, property);
    };

    return (
        <TableHead>
            <TableRow>
                {headCells.map(headCell => (
                    <TableCell key={headCell.id} align={'left'} sortDirection={orderBy === headCell.id ? order : false} >
                        <TableSortLabel active={orderBy === headCell.id} direction={order} onClick={createSortHandler(headCell.id)} >
                            {headCell.label}
                            {orderBy === headCell.id ? (
                                <span className={classes.visuallyHidden}>
                                    {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                                </span>
                            ) : null}
                        </TableSortLabel>
                    </TableCell>
                ))}
            </TableRow>
        </TableHead>
    );
}

EnhancedTableHead.propTypes = {
    classes: PropTypes.object.isRequired,
    onRequestSort: PropTypes.func.isRequired,
    onSelectAllClick: PropTypes.func.isRequired,
    order: PropTypes.oneOf(['asc', 'desc']).isRequired,
    orderBy: PropTypes.string.isRequired,
    rowCount: PropTypes.number.isRequired,
};

const useToolbarStyles = makeStyles(theme => ({
    root: {
        paddingLeft: theme.spacing(2),
        paddingRight: theme.spacing(1),
    },
    highlight:
        theme.palette.type === 'light'
            ? {
                color: theme.palette.secondary.main,
                backgroundColor: lighten(theme.palette.secondary.light, 0.85),
            }
            : {
                color: theme.palette.text.primary,
                backgroundColor: theme.palette.secondary.dark,
            },
    spacer: {
        flex: '1 1 100%',
    },
    actions: {
        color: theme.palette.text.secondary,
    },
    title: {
        flex: '0 0 auto',
    },
    paper: {
        position: 'absolute',
        backgroundColor: theme.palette.background.paper,
        borderRadius: '5px',
    },
    button: {
        display: 'block',
        marginTop: theme.spacing(2),
        color: 'white',
        backgroundColor: '#009045',
    },
    formControl: {
        margin: theme.spacing(1),
        minWidth: '-webkit-fill-available',
    },
    modalRoot: {
        backgroundColor: theme.palette.background.paper,
        minWidth: 500,
    },
    container: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    textField: {
        marginLeft: theme.spacing(0.5),
        marginRight: theme.spacing(0.5),
    },
    dense: {
        marginTop: 19,
    },
    menu: {
        width: 200,
    },
    input: {
        display: 'none',
    },
    avatar: {
        margin: theme.spacing(1),
    },
    typography: {
        padding: theme.spacing(2),
      },
}));
function parseDate(input) {
    var parts = input.split('-');
    return new Date(parts[0], parts[1]-1, parts[2]); // Note: months are 0-based
  }
const EnhancedTableToolbar = props => {
    const classes = useToolbarStyles();
    const { user } = useContext(UserContext)
    const [modalStyle] = useState(getModalStyle)
    const [openModal, setOpenModal] = useState(false)
    const [docs, setDocs] = useState([])
    const daty =  new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000 ))
    .toISOString()
    .split("T")[0] 
    const [values, setValues] = useState({
        location: '',
        name: '',
        dateStart: daty,
        dateEnd: daty,
        teacher: '',
        description: '',
        activity: '',
        registration: '',
        group: '',
        workload: '0',
    });
    const [selectedDateStart, setSelectedDateStart] = useState(new Date());
    const [selectedDateEnd, setSelectedDateEnd] = useState();
    const [message, setMessage] = useState("Selecione Uma Atividade");
    const [status, setStatus] = useState({ show: false, message: '' })
    const [fileList, setFileList] = useState({})
    const [needCalc, setNeedCalc] = useState(false)

    const [grpSelect, setGrpSelect] = useState(true)
    const [actSelect, setActSelect] = useState(true)
    const [groups, setGroups] = useState([])
    const [activities, setActivities] = useState([])
    const [resumes, setResumes] = useState([])
    const [activitiesByGroup, setActivitiesByGroup] = useState([])
    const [groupByResume, setGroupByResume] = useState([])
    const [resumeKey, setResumeKey] = useState()
    const [groupKey, setGroupKey] = useState()
    const [selectActivity, setSelectActivity] = useState({});
    const [selectResume, setSelectResume] = useState();
    const [selectGroup, setSelectGroup] = useState();
    const [activityIndex, setActivityIndex] = useState()

    const [openDialog, setOpenDialog] = useState(false)
    const [submitMessage, setSubmitMessage] = useState('')
    const [runButtons, setRunButtons] = useState(false)

    useEffect(() => {
        async function loadSolicitations() {
          const response = await axios.get('http://localhost:2222/solicitacao/infos/')
          setGroupByResume(response.data.grupos)
          setActivitiesByGroup(response.data.atividades)
          setResumes(response.data.curriculo)
        }
        loadSolicitations()
    }, [])

    useEffect(() => {
        setGroups(getGroups(groupByResume, resumeKey))
        if(selectResume !== ''){
            setGrpSelect(false)
        }
    }, [selectResume, groupByResume, resumeKey])

    useEffect(() => {
        setActivities(getActivities(activitiesByGroup, groupKey))
        if(selectGroup !== ''){
            setActSelect(false)
        }
    }, [selectGroup, activitiesByGroup, groupKey])


    useEffect(()=>{
        if(selectActivity.idAtividade){
            if(!selectActivity.docs){
                setMessage("Não foi possível verificar a documentação necessária")
                return
            }else{
                setDocs(selectActivity.docs)
                setRunButtons(true)
            }
            if(selectActivity.precisaCalcular!==true){
                setValues(v=>({ ...v, workload: 0 }));
            }
        }
    }, [selectActivity])

    const handleChangeResume = event => {
        setResumeKey(event.target.value)
        setSelectResume(event.target.value)
      }

    const handleChangeGroup = event => {
        setActivityIndex()
        setGroupKey(event.target.value)
        setSelectGroup(event.target.value)
        setValues({ ...values, [event.target.name]: event.target.value })
    }

    const handleChangeSelect = event => {
        setNeedCalc(activities[event.target.value].precisaCalcular)
        setActivityIndex(event.target.value)
        setSelectActivity(activities[event.target.value]);
        setValues({ ...values, [event.target.name]: event.target.value });
      };

    function handleFile (event, fileName){
        if (!event || !event.target || !event.target.files || event.target.files.length === 0) {
            return
        }

        const name = event.target.files[0].name
        const lastDot = name.lastIndexOf('.')
        const ext = name.substring(lastDot + 1).toLowerCase()

        if ( ext !== 'pdf' && ext !== 'jpg' && ext !== 'jpeg' && ext !== 'png' && ext !== 'zip') {
            const newFiles = Object.keys(fileList).reduce((object, key) => {
                if (key !== fileName) {
                    object[key] = fileList[key]
                }
                return object
            }, {})
            setFileList(newFiles)
            alert('Tipo de arquivo não permitido')
            return
        }
        if(fileList.length === 0){
            const fileData = {}
            fileData[fileName] = ({
                idDoc: event.target.id,
                file: event.target.files[0]
            })
            setFileList({ ...fileList, ...fileData })
            return
        } else {
            let index
            for (index = 0; index < fileList.length; index++) {
                if(fileList[index].idDoc === event.target.id){
                    fileList[index].file = event.target.files[0]
                    return
                }
            }
            const fileData = {}
            fileData[fileName] = ({
                idDoc: event.target.id,
                file: event.target.files[0]
            })
            setFileList({ ...fileList, ...fileData })
        }
    }

    const handleDateChangeStart = date => {
        if(!validateDate(date)){
            setStatus({ show: true, message: 'Data Selecionada Inválida!' })
            return
        }
        if(selectedDateEnd){
            if(!validateStartEnd(date, selectedDateEnd)){
                setStatus({ show: true, message: 'A data de inicio não pode ser posterior a data de fim!' })
                return
            }
        }
        setSelectedDateStart(date);
        setValues({ ...values, dateStart: new Date(date.getTime() - (date.getTimezoneOffset() * 60000 ))
            .toISOString()
            .split("T")[0] 
        });
    };

    const handleDateChangeEnd = date => {
        if(!validateDate(date)){
            setStatus({ show: true, message: 'Data Selecionada Inválida!' })
            return
        }
        if(selectedDateEnd){
            if(!validateStartEnd(selectedDateStart, date)){
                setStatus({ show: true, message: 'A data de inicio não pode ser posterior a data de fim!' })
                return
            }
        }
        setSelectedDateEnd(date);
        setValues({ ...values, dateEnd: new Date(date.getTime() - (date.getTimezoneOffset() * 60000 ))
            .toISOString()
            .split("T")[0] 
        });
    };

    const handleChange = () => event => {
        console.log('event.target.id', event.target.id)
        if(event.target.id === 'registration'){
            event.target.value = event.target.value.replace(/\D/g, '')
            if(_.size(event.target.value)>10){
                event.target.value=event.target.value.slice(0,10)
            }
        }else if(event.target.id==='workload'){
            console.log('event.target.value', event.target.value)
            event.target.value = event.target.value.replace(/[^0-9]+/g, '')
            if(event.target.value>0){
                event.target.value = event.target.value.replace(/^0+/, '')
            }
            if(_.size(event.target.value)>5){
                event.target.value=event.target.value.slice(0,5)
            }
        }
        setValues({ ...values, [event.target.id]: event.target.value });
    }

    function handleModal() {
        setOpenModal(true)
    }

    function handleCloseModal() {
        setOpenModal(false)
    }

    const handleCloseMessageError = () => {
        setStatus({ show: false })
    }

    const handleOpen = () => {
        setOpenDialog(true);
    };
    
      const handleClose = () => {
        setOpenDialog(false);
        window.location.reload()
    };

    async function handleSubmit(event) {
        event.preventDefault()
        if(_.size(values.name) <= 0){
            setStatus({ show: true, message: 'O Nome é obrigatório!' })
            return
        }
        if(!validateName(values.name)){
            setStatus({ show: true, message: 'Nome Inválido!' })
            return
        }
        if(!validateName(values.teacher)){
            setStatus({ show: true, message: 'Nome do Professor Inválido!' })
            return
        }
        if(!validateRegistration(values.registration)){
            setStatus({ show: true, message: 'Número de Matrícula Inválido!' })
            return
        }
        if(_.size(values.description) <= 0){
            setStatus({ show: true, message: 'A descrição da atividade é obrigatória!' })
            return
        }
        if(selectActivity.idAtividade==null){
            setStatus({ show: true, message: 'Você precisa selecionar uma atividade!' })
            return
        }
        if(_.size(fileList) === 0 || _.size(fileList) < docs.length){
            setStatus({ show: true, message: 'Você precisa anexar o(s) arquivo(s) necessário(s)!' })
            return
        }
        if(selectActivity.precisaCalcular ===true && (values.workload==null ) ){
            setStatus({ show: true, message: 'Você precisa informar a carga Horaria realizada da atividade!' })
            return
        }if(selectActivity.precisaCalcular ===true && (values.workload<=0) ){
            setStatus({ show: true, message: 'A carga horária da atividade precisa ser maior que 0!' })
            return
        }

        let hours
        if(selectActivity.precisaCalcular===true){
            hours = parseInt(values.workload) * selectActivity.ch
        } else {
            hours = selectActivity.ch
        }


        var data = {
            local: values.location,
            aluno: values.name,
            matricula: values.registration,
            dataInicio: values.dateStart,
            dataFim: values.dateEnd,
            cargaHorariaRealizada: values.workload,
            cargaHorariaSoli: hours.toString(),
            profRes: values.teacher,
            descricao: values.description,
            idAtividade: selectActivity.idAtividade.toString()
        }


        var formData = new FormData()
        _.forEach(data, (value, index)=>{
            formData.append(index, value);
        })
        _.forEach(fileList, (value)=>{
            formData.append("file", value.file)
        })
        try {
            const response = await axios.post('http://localhost:2222/solicitacao/', formData)
            console.log(response)
            if(response.status === 200){
                setSubmitMessage('Solicitação Realizada com Sucesso!')
            }
        } catch (error) {
            console.log(error.response)
            setSubmitMessage('Houve um problema ao enviar a Solicitação!')
        }finally{
            handleOpen()
        }
    }

    return (
        <>
            <Toolbar className={classes.root} >
                <div className={classes.title}>
                        <Grid container direction="column" justify="flex-start" alignItems="flex-start">
                        <Typography variant="h6" id="tableTitle">
                             Solicitações
                        </Typography>
                        <Typography variant="subtitle2" gutterBottom>
                            Olá {user}
                        </Typography>
                    </Grid>
                </div>
                <div className={classes.spacer} />
                <div className={classes.actions}>
                    <Tooltip title="Filter list">
                        <IconButton aria-label="filter list" onClick={handleModal}>
                            <AddIcon />
                        </IconButton>
                    </Tooltip>
                </div>
            </Toolbar>
            <Modal aria-labelledby="simple-modal-title" aria-describedby="simple-modal-description" open={openModal} onClose={handleCloseModal} >
                <CardContent style={modalStyle} className={classes.paper}>
                    <div className={classes.modalRoot}>                   
                        <form autoComplete="off">
                            <FormControl className={classes.formControl}>
                                <Grid container direction="column" justify="space-evenly" alignItems="stretch" spacing={2}>
                                    <Grid item xs>
                                        <Typography variant="h5" gutterBottom>
                                            Solicitação de ACG
                                        </Typography>
                                    </Grid>
                                    <Grid container direction="row" justify="space-around" alignItems="center">
                                        <Grid item xs={8}>
                                            <TextField id="name" required type="text" pattern="[A-Za-z]" label="Nome" style={{ width: '95%' }} className={classes.textField}
                                            value={values.name} onChange={handleChange('name')} margin="normal" autoComplete="off"/>
                                        </Grid>
                                        <Grid item xs={4}>
                                            <TextField id="registration" required type="number" label="Matrícula" style={{ width: '100%' }} maxLength="10" className={classes.textField}
                                                value={values.registration} onChange={handleChange('registration')} margin="normal" autoComplete="off"/>
                                        </Grid>
                                    </Grid>
                                    <Grid container direction="row" justify="space-between" alignItems="center">
                                            <FormControl style={{ width: '15%' }}>
                                                <InputLabel style={{ position: 'relative' }} htmlFor="resumeSelect">Currículo</InputLabel>
                                                <Select value={selectResume} className={classes.textField} style={{ width: '100%' }}
                                                onChange={handleChangeResume}
                                                inputProps={{
                                                    name: 'resume',
                                                    id: 'resumeSelect',
                                                }} >
                                                    {resumes.map((resume, index) => (
                                                        <MenuItem key={index} value={resume.idCurriculo} name={resume.ano} >{resume.ano}</MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                            <div style={{ width: '5%' }}></div>
                                            <FormControl style={{ width: '15%' }}>
                                                <InputLabel style={{ position: 'relative' }} htmlFor="groupSelect">Grupo da ACG</InputLabel>
                                                <Select disabled={grpSelect} value={selectGroup} className={classes.textField} style={{ width: '100%' }}
                                                onChange={handleChangeGroup}
                                                inputProps={{
                                                    name: 'group',
                                                    id: 'groupSelect',
                                                }} >
                                                    {groups.map((group, index) => (
                                                        <MenuItem key={index} value={group.idGrupo} name={group.nome} >{group.nome}</MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                            <div style={{ width: '5%' }}></div>
                                            <FormControl style={{ width: '60%', maxWidth: '40vw'}}>
                                                <InputLabel style={{ position: 'relative' }} htmlFor="activitySelect">Atividade</InputLabel>
                                                <Select disabled={actSelect} value={activityIndex} className={classes.textField} 
                                                onChange={handleChangeSelect}
                                                inputProps={{
                                                    name: 'activity',
                                                    id: 'activitySelect',
                                                }} >
                                                    {activities.map((activity, index) => (
                                                        <MenuItem style={{ maxWidth: '80vw', whiteSpace:'normal', borderBottom:'1px solid #000'}} key={index} value={index} name={activity.descricao} >{activity.descricao}</MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                    </Grid>
                                    <Grid container direction="row" justify="space-around" alignItems="center">
                                        <Grid item xs={6}>
                                            <TextField id="teacher"  label="Professor Responsável" style={{ width: '95%' }} className={classes.textField}
                                                value={values.teacher} type="text" onChange={handleChange('teacher')} margin="normal" autoComplete="off"/>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <TextField id="location"  label="Local da atividade" style={{ width: '100%' }} className={classes.textField}
                                                value={values.location} type="text" onChange={handleChange('location')} margin="normal" autoComplete="off"/>
                                        </Grid>
                                    </Grid>
                                    <Grid container direction="row" justify="space-between" alignItems="center">
                                        <Grid item xs={5}>
                                            <div style={{ width: '100%' }}>
                                                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                                    <KeyboardDatePicker id="dateStart" disableToolbar variant="inline" format="dd/MM/yyyy" margin="normal" 
                                                        label="Período da Atividade" value={selectedDateStart} onChange={handleDateChangeStart}
                                                        KeyboardButtonProps={{
                                                            'aria-label': 'change date',
                                                        }}
                                                    />
                                                </MuiPickersUtilsProvider>
                                            </div>
                                        </Grid>
                                        <Grid item xs={2} style={{ alignSelf: 'flex-end' }}>
                                            <div style={{ width: '100%' }}>
                                                <Typography variant="h6" gutterBottom>
                                                    até
                                                </Typography>
                                            </div>
                                        </Grid>
                                        <Grid item xs={5}>
                                            <div style={{ width: '100%' }}>
                                                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                                    <KeyboardDatePicker id="dateEnd" disableToolbar variant="inline" format="dd/MM/yyyy" margin="normal"
                                                        label=" " value={selectedDateEnd} onChange={handleDateChangeEnd}
                                                        KeyboardButtonProps={{
                                                            'aria-label': 'change date',
                                                        }}
                                                    />
                                                </MuiPickersUtilsProvider>
                                            </div>
                                        </Grid>
                                    </Grid>
                                    <Grid container direction="row" justify="space-around" alignItems="center">
                                        <Grid item xs={6}>
                                            <TextField id="workload" required disabled={!needCalc} label="Carga horária Realizada (em horas)" style={{ width: '95%' }}
                                                className={classes.textField} InputLabelProps={{ shrink: true }}value={values.workload} onChange={handleChange('workload')} margin="normal" autoComplete="off"/>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <TextField id="requestedWorkload"
                                                required
                                                disabled
                                                type="number"
                                                label="Carga horária a ser Solicitada (em horas)"
                                                style={{ width: '95%' }}
                                                className={classes.textField}
                                                InputLabelProps={{
                                                    shrink: true,
                                                  }}
                                                value={
                                                    selectActivity.precisaCalcular ?
                                                        selectActivity ?
                                                            values.workload ?
                                                                parseInt(values.workload) * selectActivity.ch :
                                                            0 :
                                                        "" :
                                                    selectActivity.ch
                                                }
                                                margin="normal"
                                                autoComplete="off"/>
                                        </Grid>
                                    </Grid>
                                    <Grid container justify="space-between" alignItems="center">
                                        <TextField id="description" type="text" required label="Descrição da Atividade" multiline rows="4" variant="filled" className={classes.textField}
                                            style={{ width: '100%' }} value={values.description} onChange={handleChange('description')} margin="normal" autoComplete="off"/>
                                    </Grid>
                                </Grid>
                            </FormControl>
                            <Grid container direction="row" justify="space-between" alignItems="center">
                                <Grid container direction="column" justify="center" alignItems="flex-start" style={{ width: '45%' }}>
                                {!runButtons ? (
                                    <Typography color="inherit" variant="subtitle1">
                                        {message}
                                    </Typography>
                                ) : (
                                    <Grid container direction="column" justify="center" alignItems="flex-start" style={{ width: '100%' }}>
                                        
                                        {docs.map((doc, index) => (
                                            <div key={index} style={{ marginTop: '4%' }} className="input-group">
                                                <Typography variant="body2" style={{padding:0}} className={classes.typography}>
                                                    {doc.nome}
                                                </Typography>
                                                <div>
                                                    <label className="custom-label" htmlFor={doc.idDocNecessario} />
                                                    <input 
                                                        required
                                                        type="file"
                                                        onChange={(e) => {handleFile(e, doc.nome)}} 
                                                        value={fileList[index]}
                                                        accept="image/*, .pdf"
                                                        className="custom-file-input"
                                                        id={doc.idDocNecessario}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </Grid>
                                )}
                                </Grid>
                                <Button className={classes.button} onClick={handleSubmit} >
                                    Enviar
                                </Button>
                                {/* <Button className={classes.button} onClick={handleTeste} >
                                    testar
                                </Button> */}
                            </Grid>
                        </form>
                        <Dialog open={openDialog} onClose={handleClose} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description" >
                        <Grid container direction="column" justify="space-around" alignItems="center">
                            <DialogTitle id="alert-dialog-title">{submitMessage}</DialogTitle>
                            <DialogActions>
                                <Button onClick={handleClose} color="primary" autoFocus>
                                    OK!
                                </Button>
                            </DialogActions>
                        </Grid>
                        </Dialog>
                        {status.show && (
                        <Grid container direction="column" justify="center" alignItems="center" >
                                <Chip avatar={
                                    <Avatar>
                                        <WarningIcon />
                                    </Avatar>
                                }
                                label={status.message}
                                onDelete={handleCloseMessageError}
                                className={classes.chip}
                                style={{ color: "#222222" }}
                                />
                            </Grid>
                        )}
                    </div>
                </CardContent>
            </Modal>
        </>
    );
};

const useStyles = makeStyles(theme => ({
    root: {
        width: '100%',
        marginTop: theme.spacing(3),
    },
    paper: {
        width: '95%',
        marginBottom: theme.spacing(2),
    },
    paperModal: {
        position: 'absolute',
        backgroundColor: theme.palette.background.paper,
        borderRadius: '5px',
    },
    table: {
        minWidth: 750,
    },
    tableWrapper: {
        overflowX: 'auto',
    },
    visuallyHidden: {
        border: 0,
        clip: 'rect(0 0 0 0)',
        height: 1,
        margin: -1,
        overflow: 'hidden',
        padding: 0,
        position: 'absolute',
        top: 20,
        width: 1,
    },
    button: {
        marginTop: theme.spacing(2),
        color: 'white',
        backgroundColor: '#009045',
    },
    margin: {
        margin: theme.spacing(1),
        color: 'white',
        backgroundColor: '#009045',
    },
    extendedIcon: {
        marginRight: theme.spacing(1),
    },
    textField: {
        marginLeft: theme.spacing(0.1),
        marginRight: theme.spacing(0.1),
    },
}));

export default function EnhancedTable() {
    const classes = useStyles();
    const [modalStyle] = useState(getModalStyle)
    const [order, setOrder] = useState('asc');
    const [orderBy, setOrderBy] = React.useState();
    const [selected, setSelected] = React.useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [open, setOpen] = useState(false)
    const [openDetails, setOpenDetails] = useState(false)
    const [valueRadio, setValueRadio] = useState('')
    const [valueRadioInfo, setValueRadioInfo] = useState('')
    const [avaliation, setAvaliation] = useState({
        activityId: "",
        hourLoad: "",
        obs: "",
        status: ""
    })
    const [obsShow, setObsShow] = useState(false);
    const [actSelect, setActSelect] = useState(false);
    const [hourLoadShow, setHourLoadShow] = useState(false);
    const [changeInfo, setChangeInfo] = useState(false);
    const [idSol, setIdsol] = useState()
    const [anexos, setAnexos] = useState([])
    const [openDialog, setOpenDialog] = useState(false)
    const [status, setStatus] = useState({ show: false, message: '' })
    const [submitMessage, setSubmitMessage] = useState('')
    const [deferred, setDeferred] = useState(false)
    const [showButton, setShowButton] = useState(false)
    const [respInfoChange, setRespInfoChange] = useState('')
    const [openDialogDelete, setOpenDialogDelete] = useState(false)
    const [openDialogDeleteAvaliation, setOpenDialogDeleteAvaliation] = useState(false)
    const [idDelete, setIdDelete] = useState()
    const [idDeleteAvaliation, setIdDeleteAvaliation] = useState()

    const [groups, setGroups] = useState([])
    const [activities, setActivities] = useState([])
    const [activitiesByGroup, setActivitiesByGroup] = useState([])
    const [groupKey, setGroupKey] = useState()
    const [selectValues, setSelectValues] = useState({
        group: '',
        activity: '',
      });

    const [rows, setRows] = useState([])

    useEffect(() => {
        async function loadSolicitations() {
          const response = await axios.get('http://localhost:2222/solicitacao/infos/')
          setGroups(response.data.grupos)
          setActivitiesByGroup(response.data.atividades)
          setActivities(response.data.atividades)
        }
        loadSolicitations()
      }, [])

      useEffect(() => {
        setActivities(getActivities(activitiesByGroup, groupKey))
        if(selectValues.group !== ''){
            setActSelect(false)
        } 

      }, [activitiesByGroup, groupKey, selectValues])

    const handleAvaliation = () => event => {
        if(event.target.id==='hourLoad'){
            event.target.value = event.target.value.replace(/[^0-9]+/g, '')
            if(event.target.value>0){
                event.target.value = event.target.value.replace(/^0+/, '')
            }
            if(_.size(event.target.value)>5){
                event.target.value=event.target.value.slice(0,5)
            }
        }
        setAvaliation({ ...avaliation, [event.target.id]: event.target.value });
    }

    const handleCloseMessageError = () => {
        setStatus({ show: false })
    }

    const handleChangeGroup = event => {
        setGroupKey(event.target.value)
        setSelectValues(oldValues => ({
            ...oldValues,
            [event.target.name]: event.target.value,
          }));
      };

    const handleChangeSelect = event => {
        setSelectValues(oldValues => ({
          ...oldValues,
          [event.target.name]: event.target.value,
        }));
        setAvaliation({ ...avaliation, activityId: event.target.value })
      };

    const handleChangeDeferred = event => {
        setDeferred(true)
        setHourLoadShow(true);
        setObsShow(true);
        setShowButton(true)
        if(respInfoChange === 'yes') {
            setChangeInfo(true)
        }
        setAvaliation({ ...avaliation, status: "true" })
      };

    function  handleInfoChange(resp) {
        if(resp === 'yes') {
            setRespInfoChange('yes')
            setChangeInfo(true)
        }
        if(resp === 'no') {
            setRespInfoChange('no')
            setChangeInfo(false)
        }
    }

    const handleChangeRejected = event => {
        setDeferred(false)
        setObsShow(true);
        setHourLoadShow(false);
        setChangeInfo(false)
        setShowButton(true)
        setAvaliation({ ...avaliation, status: "false" })
      };

    const handleChangeRadio = event => {
        setValueRadio(event.target.value);
      };
    
    const handleChangeRadioInfo = event => {
        setValueRadioInfo(event.target.value);
      };

    const handleModal = (index, id) => {
        setIdsol(id)
        setOpen({ open: open, [index]: !open });
    };
    
    const handleModalDetails = (index, id) => {
        setIdsol(id)
        setOpenDetails({ openDetails: openDetails, [index]: !openDetails });
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleCloseDetails = () => {
        setOpenDetails(false);
    };

    useEffect(() => {
        async function loadSolicitations() {
          const response = await axios.get('http://localhost:2222/solicitacao')
          setRows(response.data)
        }
        loadSolicitations()
    }, [])
    
    useEffect(() => {
        if(idSol){
            async function loadAnexos() {
                const response = await axios.get(`http://localhost:2222/avaliacao/infos/${idSol}`)
                setAnexos(response.data.anexos)
                setAvaliation({ ...avaliation,
                    activityId: response.data.atividade.idAtividade })
                }
                loadAnexos()
            }
        }, [idSol])
    
    async function handleDelete (id) {
        console.log(id)
        setOpenDialogDelete(false)
            axios.delete(`http://localhost:2222/solicitacao/${id}`, { params: { id: id } })
            .then(response=>{
                console.log(response)
                console.log("foi")
                setSubmitMessage('Solicitação Deletada com Sucesso!')
                handleOpenDialog()
            }).catch(error=> {
            console.log(error.response)
            setSubmitMessage('Houve um problema ao deletar a Solicitação!')
            handleOpenDialog()
        })
    }
    
    
    async function handleDeleteAvaliation (id) {
        setOpenDialogDeleteAvaliation(false)
        axios.delete(`http://localhost:2222/avaliacao/${id}`, { params: { id: id } })
            .then(response=>{
                console.log(response)
                setSubmitMessage('Avaliação Deletada com Sucesso!')
                handleOpenDialog()
            }).catch (error=> {
                console.log(error.response)
                setSubmitMessage('Houve um problema ao deletar a Avaliação!')
            })
    }

    const handleRequestSort = (event, property) => {
        const isDesc = orderBy === property && order === 'desc';
        setOrder(isDesc ? 'asc' : 'desc');
        setOrderBy(property);
    };

    const handleSelectAllClick = event => {
        if (event.target.checked) {
            const newSelecteds = rows.map(n => n.name);
            setSelected(newSelecteds);
            return;
        }
        setSelected([]);
    };

    const handleClick = (event, name) => {
        const selectedIndex = selected.indexOf(name);
        let newSelected = [];

        if (selectedIndex === -1) {
            newSelected = newSelected.concat(selected, name);
        } else if (selectedIndex === 0) {
            newSelected = newSelected.concat(selected.slice(1));
        } else if (selectedIndex === selected.length - 1) {
            newSelected = newSelected.concat(selected.slice(0, -1));
        } else if (selectedIndex > 0) {
            newSelected = newSelected.concat(
                selected.slice(0, selectedIndex),
                selected.slice(selectedIndex + 1),
            );
        }

        setSelected(newSelected)
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage)
    };

    const handleChangeRowsPerPage = event => {
        setRowsPerPage(+event.target.value);
        setPage(0)
    };

    const handleOpenDialog = () => {
        setOpenDialog(true)
    };
    
    const handleCloseDialog = () => {
        setOpenDialog(false)
        window.location.reload()
    };

    const handleOpenDialogDelete = (id) => {
        setSubmitMessage('Tem certeza que deseja deletar essa Solicitação?')
        setOpenDialogDelete(true)
        setIdDelete(id)
    };

    const handleOpenDialogDeleteAvaliation = (id) => {
        console.log(id)
        setSubmitMessage('Tem certeza que deseja remover a Avaliação?')
        setOpenDialogDeleteAvaliation(true)
        setIdDeleteAvaliation(id)
    };
    
    const handleCloseDialogDelete = () => {
        setOpenDialogDelete(false)
        window.location.reload()
    };
    
    const handleCloseDialogDeleteAvaliation = () => {
        setOpenDialogDeleteAvaliation(false)
        window.location.reload()
    };

    async function handleSubmit(event) {
        var isEmpty = avaliation.obs.trim()
        if(!isEmpty && avaliation.status !== "true"){
            setStatus({ show: true, message: 'A observação (parecer) é necessária!' })
            return
        }
        if(deferred) {
            if(avaliation.hourLoad === undefined || avaliation.hourLoad === null || avaliation.hourLoad === ''){
                setStatus({ show: true, message: 'É necessário atribuir uma quantidade de horas!' })
                return
            }
        }

        var data = {
            cargaHorariaAtribuida: avaliation.hourLoad,
            idSolicitacao: idSol.toString(),
            parecer: avaliation.obs,
            deferido: avaliation.status
        }
        if(changeInfo){
            data['idAtividade']= avaliation.activityId.toString()
        }
        const response = await axios.post(`http://localhost:2222/avaliacao/${idSol}`, data)

        if(response){
            setSubmitMessage('Avaliação Realizada com Sucesso!')
            handleOpenDialog()
        } else {
            setSubmitMessage('Houve um problema ao realizar a Avaliação!')
            handleOpenDialog()
        }
    }

    const emptyRows = rowsPerPage - Math.min(rowsPerPage, rows.length - page * rowsPerPage);

    return (
        <div className={classes.root}>
            <Grid container direction="row" justify="center" alignItems="center">
                <Paper className={classes.paper} style={{ marginBottom: '4%' }}>
                    <EnhancedTableToolbar />
                    <div className={classes.tableWrapper}>
                        <Table className={classes.table} aria-labelledby="tableTitle" size={'medium'} >
                            <EnhancedTableHead classes={classes} order={order} orderBy={orderBy}
                                onSelectAllClick={handleSelectAllClick} onRequestSort={handleRequestSort} rowCount={rows.length} />
                            <TableBody>
                                {stableSort(rows, getSorting(order, orderBy))
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((row, index) => {
                                        console.log(row)
                                        let atividade
                                        if(row.avaliacao && row.avaliacao.novaAtividade !=null )
                                            atividade = row.avaliacao.novaAtividade 
                                        else 
                                            atividade = row.atividade
                                        return (
                                            <TableRow onClick={event => handleClick(event, row.idSolicitacao)} role="checkbox"
                                                tabIndex={-1} key={row.idSolicitacao} >
                                                <TableCell align="left" component="th" id={row.idSolicitacao} style={{ padding: 14 }} scope="row" padding="none">
                                                    {row.nomeAluno}
                                                </TableCell>
                                                <TableCell align="left">
                                                    <Tooltip TransitionComponent={Zoom} placement="top" title={atividade.descricao}>
                                                    <span>
                                                    {_.size(atividade.descricao)>33?atividade.descricao.slice(0,30)+'...':atividade.descricao}
                                                    </span>
                                                    </Tooltip>
                                                </TableCell>
                                                <TableCell align="left">{atividade.grupo.nome}</TableCell>
                                                <TableCell align="left">{parseDate(row.dataAtual).toLocaleDateString(
                                                    'pt-BR'
                                                )}</TableCell>
                                                <TableCell align="left">{row.status}</TableCell>
                                                <TableCell align="left">
                                                    <Grid container direction="row" justify="flex-start" alignItems="center" style={{flexWrap:'nowrap'}}>
                                                    {row.status === 'Pendente' || row.status === 'PENDENTE' || row.status === 'pendente' ? (
                                                        <>
                                                        <Tooltip TransitionComponent={Zoom} placement="top" title='Avaliar'>
                                                            <IconButton onClick={() => handleModal(index, row.idSolicitacao)}>
                                                                <PostAddIcon style={{color: 'green'}} />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip TransitionComponent={Zoom} placement="top" title='Deletar Avaliação'>
                                                            <span>
                                                                <IconButton disabled >
                                                                    <HighlightOffIcon style={{ opacity: 0.5 }}/>
                                                                </IconButton>
                                                            </span>
                                                        </Tooltip>
                                                        <Tooltip TransitionComponent={Zoom} placement="top" title='Deletar Solicitação'>
                                                            <IconButton onClick={() => handleOpenDialogDelete(row.idSolicitacao)}>
                                                                <DeleteIcon style={{color: 'red'}} />
                                                            </IconButton>
                                                        </Tooltip>
                                                        </>
                                                    ) : (
                                                        <>
                                                        <Tooltip TransitionComponent={Zoom} placement="top" title='Avaliar'>
                                                            <span>
                                                                <IconButton disabled >
                                                                    <PostAddIcon style={{ opacity: 0.5 }} />
                                                                </IconButton>
                                                            </span>    
                                                        </Tooltip>
                                                        <Tooltip TransitionComponent={Zoom} placement="top" title='Deletar Avaliação'>
                                                        <IconButton onClick={() => handleOpenDialogDeleteAvaliation(row.avaliacao.idAvaliacao)}>
                                                                <HighlightOffIcon style={{color: 'red'}}/>
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip TransitionComponent={Zoom} placement="top" title='Deletar Solicitação'>
                                                        <span>    
                                                            <IconButton disabled >
                                                                <DeleteIcon style={{ opacity: 0.5 }} />
                                                            </IconButton>
                                                        </span>
                                                       </Tooltip>
                                                            </>
                                                    )}
                                                    <Tooltip TransitionComponent={Zoom} placement="top" title='Informações'>
                                                        <IconButton onClick={() => handleModalDetails(index, row.idSolicitacao)}>
                                                            <VisibilityIcon style={{color: 'blue'}}/>
                                                        </IconButton>
                                                    </Tooltip>
                                                    </Grid>
                                                </TableCell>
                                                <Modal aria-labelledby="simple-modal-title" aria-describedby="simple-modal-description"
                                                    open={open[index]} onClose={handleClose} >
                                                    <CardContent style={modalStyle} className={classes.paperModal}>                                                        
                                                        <Grid container direction="column" justify="space-evenly" alignItems="stretch" spacing={2}>
                                                            <Grid item xs>
                                                                <Typography variant="h5" gutterBottom>
                                                                    Avaliação de Solicitação
                                                                </Typography>
                                                            </Grid>
                                                            <Grid container direction="row" justify="space-around" alignItems="center">
                                                                <Grid item xs={6}>
                                                                    <Grid container direction="row" justify="flex-start" alignItems="center">
                                                                        <Typography paragraph >
                                                                            <strong>Aluno: </strong>{row.nomeAluno}
                                                                        </Typography>
                                                                    </Grid>
                                                                </Grid>
                                                                <Grid item xs={6}>
                                                                    <Grid container direction="row" justify="flex-start" alignItems="center">
                                                                        <Typography paragraph>
                                                                            <strong>Matrícula: </strong>{row.matricula}
                                                                        </Typography>
                                                                    </Grid>
                                                                </Grid>
                                                            </Grid>
                                                            <Grid container direction="row" justify="space-between" alignItems="center">
                                                                <Grid item xs={6}>
                                                                    <Typography paragraph >
                                                                        <strong>Grupo: </strong>{row.atividade.grupo.nome}
                                                                    </Typography>
                                                                </Grid>
                                                                <Grid item xs={6}>
                                                                    <Typography paragraph >
                                                                        <strong>Atividade: </strong>{row.atividade.descricao}
                                                                    </Typography>
                                                                </Grid>
                                                            </Grid>
                                                            <Grid container direction="row" justify="space-around" alignItems="center">
                                                                <Grid item xs={6}>
                                                                    <Typography paragraph>
                                                                        <strong>Professor Responsável: </strong>{row.profRes}
                                                                    </Typography>
                                                                </Grid>
                                                                <Grid item xs={6}>
                                                                    <Typography paragraph>
                                                                        <strong>Local: </strong>{row.local}
                                                                    </Typography>
                                                                </Grid>
                                                            </Grid>
                                                            <Grid container direction="row" justify="space-between" alignItems="center">
                                                                <Grid item xs={6}>
                                                                    <Typography paragraph>
                                                                        <strong>Início: </strong>{parseDate(row.dataInicio).toLocaleDateString(
                                                                            'pt-BR'
                                                                        )}
                                                                    </Typography>
                                                                </Grid>
                                                                <Grid item xs={6}>
                                                                    <Typography paragraph>
                                                                        <strong>Fim: </strong>{parseDate(row.dataFim).toLocaleDateString(
                                                                            'pt-BR'
                                                                        )}
                                                                    </Typography>
                                                                </Grid>
                                                            </Grid>
                                                            <Grid container direction="row" justify="flex-start" alignItems="center">
                                                                <Grid item xs={6}>
                                                                    <Typography paragraph>
                                                                        <strong>Carga Horária Solicitada: </strong>{row.cargaHorariaSoli} hora(s)
                                                                    </Typography>
                                                                </Grid>
                                                            </Grid>
                                                            <Grid container justify="space-between" alignItems="center">
                                                                <Typography paragraph>
                                                                    <strong>Descrição: </strong>{row.descricao}
                                                                </Typography>
                                                            </Grid>
                                                            <Grid container direction="row" justify="flex-start" alignItems="center">
                                                                <Grid item xs={6}>
                                                                    <Typography paragraph style={{ marginBottom: 0 }}>
                                                                        <strong>Comprovantes: </strong>
                                                                    </Typography>
                                                                </Grid>
                                                            </Grid>
                                                            <Grid container direction="column" justify="center" alignItems="flex-start">
                                                                {anexos.map((anexo, index) => (
                                                                    <Grid item key={anexo.idAnexo} >
                                                                        <Grid container direction="row" justify="flex-start" alignItems="flex-start" style={{ width: '100%', margin: '1%' }}>
                                                                            <Fab 
                                                                                style={{padding:'3px 8px', borderRadius:4}}
                                                                                id={anexo.idDocNecessario}
                                                                                onClick={(e) => {
                                                                                    window.open(
                                                                                        `http://localhost:2222/avaliacao/file/${anexo.nome}`,
                                                                                        '_blank',
                                                                                        'noopener'
                                                                                    )
                                                                                }}
                                                                                variant="extended"
                                                                                color="primary"
                                                                                aria-label="attach"
                                                                                className={classes.margin}>
                                                                                <GetAppIcon className={classes.extendedIcon} />
                                                                                {anexo.doc.nome}
                                                                            </Fab>
                                                                        </Grid>
                                                                    </Grid>
                                                                ))}
                                                            </Grid>
                                                            <Divider style={{ marginBottom: "1%" }}/>
                                                            <Grid container direction="row" justify="space-between" alignItems="center">
                                                                <FormControl component="fieldset">
                                                                    <FormLabel component="legend">Avaliação</FormLabel>
                                                                    <RadioGroup aria-label="position" name="position" value={valueRadio} onChange={handleChangeRadio} row required>
                                                                        <FormControlLabel value="def"
                                                                        control={<Radio color="primary" />}
                                                                        label="Deferir" labelPlacement="end" onChange={handleChangeDeferred}/>
                                                                        <FormControlLabel value="indef"
                                                                        control={<Radio color="secondary" />}
                                                                        label="Indeferir" labelPlacement="end" onChange={handleChangeRejected}/>
                                                                    </RadioGroup>
                                                                </FormControl>
                                                            </Grid>
                                                            <TextField
                                                                id="hourLoad"
                                                                required
                                                                label="Horas Aproveitadas"
                                                                style={{ width: 'fit-content', display: hourLoadShow === true ? "flex" : "none" }}
                                                                className={classes.textField}
                                                                value={avaliation.hourLoad}
                                                                onChange={handleAvaliation('hourLoad')}
                                                                margin="normal"
                                                                autoComplete="off"
                                                                maxLength="5"
                                                            />
                                                            <TextField
                                                                id="obs"
                                                                required={!hourLoadShow}
                                                                label="Observações"
                                                                multiline rows="4"
                                                                style={{ display: obsShow === true ? "flex" : "none" }}
                                                                className={classes.textField}
                                                                value={avaliation.obs}
                                                                onChange={handleAvaliation('obs')}
                                                                margin="normal"
                                                                variant="filled"
                                                            />
                                                        </Grid>
                                                        <Grid container direction="row" justify="space-between" alignItems="center" style={{ display: hourLoadShow === true ? "flex" : "none" }}>
                                                                <FormControl style={{ marginTop: 10 }} component="fieldset">
                                                                    <FormLabel component="legend">Necessita mudar o Grupo e/ou Atividade?</FormLabel>
                                                                    <RadioGroup aria-label="position" name="position" value={valueRadioInfo} onChange={handleChangeRadioInfo} row required>
                                                                        <FormControlLabel value="yes"
                                                                        control={<Radio color="primary" />}
                                                                        label="Sim" labelPlacement="end" onChange={(e) => {handleInfoChange('yes')}}/>
                                                                        <FormControlLabel value="no"
                                                                        control={<Radio color="secondary" />}
                                                                        label="Não" labelPlacement="end" onChange={(e) => {handleInfoChange('no')}}/>
                                                                    </RadioGroup>
                                                                </FormControl>
                                                            </Grid>
                                                        <Grid container direction="row" justify="space-between" alignItems="center">
                                                            <div style = {{marginTop: '2%', width: '100%', display: changeInfo === true ? "flex" : "none" }}>
                                                                <FormControl style = {{width: '35%'}}>
                                                                    <InputLabel style = {{ position: 'relative' }}htmlFor="groupSelect">
                                                                        Grupo da ACG
                                                                    </InputLabel>
                                                                    <Select
                                                                        value={selectValues.group}
                                                                        className={classes.textField}
                                                                        style={{ width: '100%', marginTop: 0 }}
                                                                        onChange={handleChangeGroup}
                                                                        inputProps={{
                                                                            name: 'group',
                                                                            id: 'groupSelect',
                                                                        }}
                                                                        >
                                                                        {groups.map((group, index) => (
                                                                            <MenuItem
                                                                                key={index}
                                                                                value={group.idGrupo}
                                                                                name={group.nome}
                                                                            >
                                                                                {group.nome}
                                                                            </MenuItem>
                                                                        ))}
                                                                    </Select>
                                                                </FormControl>
                                                                <div style={{ margin: '2%'}}></div>
                                                                <FormControl  style={{ width: '60%', maxWidth: '40vw'}}>
                                                                    <InputLabel  style = {{ position: 'relative' }} htmlFor="activitySelect">
                                                                        Atividade
                                                                    </InputLabel>
                                                                    <Select
                                                                        value={selectValues.activity}
                                                                        disabled={actSelect}
                                                                        className={classes.textField}
                                                                        style={{ width: '100%', marginTop: 0 }}
                                                                        onChange={handleChangeSelect}
                                                                        inputProps={{
                                                                            name: 'activity',
                                                                            id: 'activitySelect',
                                                                        }}
                                                                        >
                                                                            {activities.map((activity, index) => (
                                                                                <MenuItem
                                                                                style={{ maxWidth: '80vw', whiteSpace:'normal', borderBottom:'1px solid #000'}}
                                                                                key={index}
                                                                                value={activity.idAtividade}
                                                                                name={activity.descricao}
                                                                                >
                                                                                    {activity.descricao}
                                                                                </MenuItem>
                                                                            ))}
                                                                    </Select>
                                                                </FormControl>
                                                            </div>
                                                        </Grid>
                                                        <Grid container direction="row" justify="flex-end" alignItems="center">
                                                            <Button style={{ marginTop: 5, display: showButton === true ? "flex" : "none" }} onClick={handleSubmit} variant="contained" color="primary" className={classes.button}>
                                                                <PostAddIcon />
                                                                Confirmar
                                                            </Button>
                                                        </Grid>
                                                        {status.show && (
                                                            <Grid container direction="column" justify="center" alignItems="center" >
                                                                <Chip avatar={
                                                                        <Avatar>
                                                                            <WarningIcon />
                                                                        </Avatar>
                                                                    }
                                                                    label={status.message}
                                                                    onDelete={handleCloseMessageError}
                                                                    className={classes.chip}
                                                                    style={{ color: "#222222" }}
                                                                    />
                                                                </Grid>
                                                        )}
                                                    </CardContent>
                                                </Modal>
                                                <Modal aria-labelledby="simple-modal-title" aria-describedby="simple-modal-description"
                                                    open={openDetails[index]} onClose={handleCloseDetails} >
                                                    <CardContent style={modalStyle} className={classes.paperModal}>
                                                        <Grid container direction="column" justify="space-evenly" alignItems="stretch" spacing={2}>
                                                            <Grid item xs>
                                                                <Typography variant="h5" gutterBottom>
                                                                    Solicitação
                                                                </Typography>
                                                            </Grid>
                                                            <Grid container direction="row" justify="space-around" alignItems="center">
                                                                <Grid item xs={6}>
                                                                    <Grid container direction="row" justify="flex-start" alignItems="center">
                                                                        <Typography paragraph >
                                                                            <strong>Aluno: </strong>{row.nomeAluno}
                                                                        </Typography>
                                                                    </Grid>
                                                                </Grid>
                                                                <Grid item xs={6}>
                                                                    <Grid container direction="row" justify="flex-start" alignItems="center">
                                                                        <Typography paragraph>
                                                                            <strong>Matrícula: </strong>{row.matricula}
                                                                        </Typography>
                                                                    </Grid>
                                                                </Grid>
                                                            </Grid>
                                                            <Grid container direction="row" justify="space-between" alignItems="center">
                                                                <Grid item xs={6}>
                                                                    <Typography paragraph >
                                                                        <strong>Currículo: </strong>{row.atividade.grupo.curriculo.ano}
                                                                    </Typography>
                                                                </Grid>
                                                                <Grid item xs={6}>
                                                                    <Typography paragraph >
                                                                        <strong>Grupo: </strong>{row.atividade.grupo.nome}
                                                                    </Typography>
                                                                </Grid>
                                                            </Grid>
                                                            <Grid container direction="row" justify="space-around" alignItems="center">
                                                                <Grid item xs={6}>
                                                                    <Typography paragraph >
                                                                        <strong>Atividade: </strong>{row.atividade.descricao}
                                                                    </Typography>
                                                                </Grid>
                                                                <Grid item xs={6}>
                                                                    <Typography paragraph>
                                                                        <strong>Professor Responsável: </strong>{row.profRes}
                                                                    </Typography>
                                                                </Grid>
                                                            </Grid>
                                                            <Grid container direction="row" justify="space-between" alignItems="center">
                                                                <Grid item xs={6}>
                                                                    <Typography paragraph>
                                                                        <strong>Início: </strong>{parseDate(row.dataInicio).toLocaleDateString(
                                                                            'pt-BR'
                                                                        )}
                                                                    </Typography>
                                                                </Grid>
                                                                <Grid item xs={6}>
                                                                    <Typography paragraph>
                                                                        <strong>Fim: </strong>{parseDate(row.dataFim).toLocaleDateString(
                                                                            'pt-BR'
                                                                        )}
                                                                    </Typography>
                                                                </Grid>
                                                            </Grid>
                                                            <Grid container direction="row" justify="flex-start" alignItems="center">
                                                                <Grid item xs={6}>
                                                                    <Typography paragraph>
                                                                        <strong>Local: </strong>{row.local}
                                                                    </Typography>
                                                                </Grid>
                                                                <Grid item xs={6}>
                                                                    <Typography paragraph>
                                                                        <strong>Carga Horária Solicitada: </strong>{row.cargaHorariaSoli} hora(s)
                                                                    </Typography>
                                                                </Grid>
                                                            </Grid>
                                                            <Grid container justify="space-between" alignItems="center">
                                                                <Typography paragraph>
                                                                    <strong>Descrição: </strong>{row.descricao}
                                                                </Typography>
                                                            </Grid>
                                                            <Grid container direction="row" justify="flex-start" alignItems="center">
                                                                <Grid item xs={6}>
                                                                    <Typography paragraph style={{ marginBottom: 0 }}>
                                                                        <strong>Comprovantes: </strong>
                                                                    </Typography>
                                                                </Grid>
                                                            </Grid>
                                                            <Grid container direction="column" justify="center" alignItems="flex-start">
                                                                {anexos.map((anexo, index) => (
                                                                    <Grid item key={anexo.idAnexo} >
                                                                        <Grid container direction="row" justify="center" alignItems="center" style={{ width: '100%', margin: '1%' }}>
                                                                            <Fab 
                                                                            style={{padding:'3px 8px', borderRadius:4}}
                                                                                id={anexo.idDocNecessario}
                                                                                onClick={(e) => {
                                                                                    window.open(
                                                                                        `http://localhost:2222/avaliacao/file/${anexo.nome}`,
                                                                                        '_blank',
                                                                                        'noopener'
                                                                                    )
                                                                                }}
                                                                                variant="extended"
                                                                                color="primary"
                                                                                aria-label="attach"
                                                                                className={classes.margin}>
                                                                                <GetAppIcon className={classes.extendedIcon} />
                                                                                {anexo.doc.nome}
                                                                            </Fab>
                                                                        </Grid>
                                                                    </Grid>
                                                                ))}
                                                            </Grid>
                                                            <Divider style={{ marginBottom: "1%" }}/>
                                                        </Grid>
                                                        <Grid container direction="column" justify="space-evenly" alignItems="stretch" spacing={2}>
                                                            <Grid container justify="flex-start" alignItems="center">
                                                                <Typography paragraph>
                                                                    <strong>Situação: </strong><p style={{marginTop:0,fontSize:20,fontWeight:'bold',color:row.status!='Pendente'?row.status==='Deferido'?'#0A0':'#A00':"#00A"}}>{row.status}</p>
                                                                </Typography>
                                                            </Grid>
                                                        </Grid>
                                                        {row.avaliacao != null ? (
                                                            <Grid container direction="column" justify="space-evenly" alignItems="stretch" spacing={2}>
                                                                <Grid container direction="row" justify="space-around" alignItems="center">
                                                                    <Grid item xs={6}>
                                                                        <Grid container direction="row" justify="flex-start" alignItems="center">
                                                                            <Typography paragraph >
                                                                                <strong>Horas(s) Atribuída(s): </strong>{row.avaliacao.cargaHorariaAtribuida}
                                                                            </Typography>
                                                                        </Grid>
                                                                    </Grid>
                                                                    <Grid item xs={6}>
                                                                        <Grid container direction="row" justify="flex-start" alignItems="center">
                                                                            <Typography paragraph>
                                                                                <strong>Data da Avaliação: </strong>{parseDate(row.avaliacao.dataAvaliacao).toLocaleDateString(
                                                                                    'pt-BR'
                                                                                )}
                                                                            </Typography>
                                                                        </Grid>
                                                                    </Grid>
                                                                </Grid>
                                                                <Grid container direction="row" justify="flex-start" alignItems="center">
                                                                    <Grid item xs={12}>
                                                                        <Typography paragraph >
                                                                            <strong>Parecer do coordenador: </strong>{row.avaliacao.justificativa}
                                                                        </Typography>
                                                                    </Grid>
                                                                </Grid>
                                                                {row.avaliacao.novaAtividade?
                                                                    <Grid container direction="row" justify="flex-start" alignItems="flex-start">
                                                                        <Grid item xs={6}>
                                                                            <Typography paragraph >
                                                                                <strong>Novo Grupo: </strong>{row.avaliacao.novaAtividade.grupo.nome}
                                                                            </Typography>
                                                                        </Grid>
                                                                        <Grid item xs={6}>
                                                                            <Typography paragraph >
                                                                                <strong>Nova Atividade: </strong>{row.avaliacao.novaAtividade.descricao}
                                                                            </Typography>
                                                                        </Grid>
                                                                    </Grid>
                                                                :null}
                                                            </Grid>
                                                        ) : 
                                                            null
                                                        }
                                                            
                                                        <Grid container direction="row" justify="flex-end" alignItems="center">
                                                            <Button style={{ marginTop: 5}} onClick={handleCloseDetails} variant="contained" color="primary" className={classes.button}>
                                                                Fechar
                                                            </Button>
                                                        </Grid>
                                                    </CardContent>
                                                </Modal>
                                                <Dialog open={openDialog} onClose={handleCloseDialog} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description" >
                                                    <Grid container direction="column" justify="space-around" alignItems="center">
                                                        <DialogTitle id="alert-dialog-title">{submitMessage}</DialogTitle>
                                                        <DialogActions>
                                                            <Button onClick={handleCloseDialog} color="primary" autoFocus>
                                                                    OK!
                                                            </Button>
                                                        </DialogActions>
                                                    </Grid>
                                                </Dialog>
                                                <Dialog open={openDialogDelete} onClose={handleCloseDialogDelete} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description" >
                                                    <Grid container direction="column" justify="space-around" alignItems="center">
                                                        <DialogTitle id="alert-dialog-title">{submitMessage}</DialogTitle>
                                                        <DialogActions>
                                                            <Button onClick={() => handleDelete(idDelete)} color="primary" autoFocus>
                                                                    Confirmar
                                                            </Button>
                                                            <Button onClick={handleCloseDialogDelete} color="primary" autoFocus>
                                                                    Cancelar
                                                            </Button>
                                                        </DialogActions>
                                                    </Grid>
                                                </Dialog>
                                                <Dialog open={openDialogDeleteAvaliation} onClose={handleCloseDialogDeleteAvaliation} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description" >
                                                    <Grid container direction="column" justify="space-around" alignItems="center">
                                                        <DialogTitle id="alert-dialog-title">{submitMessage}</DialogTitle>
                                                        <DialogActions>
                                                            <Button onClick={() => handleDeleteAvaliation(idDeleteAvaliation)} color="primary" autoFocus>
                                                                    Confirmar
                                                            </Button>
                                                            <Button onClick={handleCloseDialogDeleteAvaliation} color="primary" autoFocus>
                                                                    Cancelar
                                                            </Button>
                                                        </DialogActions>
                                                    </Grid>
                                                </Dialog>
                                            </TableRow>
                                        );
                                    })}
                                {emptyRows > 0 && (
                                    <TableRow style={{ height: 49 * emptyRows }}>
                                        <TableCell colSpan={6} />
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                    <TablePagination rowsPerPageOptions={[10, 25]} component="div" count={rows.length} rowsPerPage={rowsPerPage} page={page}
                        backIconButtonProps={{
                            'aria-label': 'previous page',
                        }}
                        nextIconButtonProps={{
                            'aria-label': 'next page',
                        }}
                        onChangePage={handleChangePage}
                        onChangeRowsPerPage={handleChangeRowsPerPage}
                    />
                    
                </Paper>
            </Grid>
        </div>
    );
}