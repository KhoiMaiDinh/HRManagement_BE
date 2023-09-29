import BadRequestError from '../errors/badRequestError.js';
import NotFoundError from '../errors/notFoundError.js';
import Position from '../models/Position.js';
import SalaryGrade from '../models/SalaryGrade.js';


const getSalaryGrades = async(req,res) =>{
    try{
        const salaryGrades = await SalaryGrade.find({isDeleted: false}).populate({
            
            path: 'positionCode',
        })
        if(!salaryGrades){
            throw new NotFoundError('Not found any salary grade')
        }
        // const positionCode = await SalaryGrade.distinct('positionCode');
        res.status(200).json(salaryGrades);

    }catch(err){
        throw err
    }
}

const getSalaryGrade = async (req,res) =>{
    const {id} = req.params;
    try{
        const salaryGrade = await SalaryGrade.findById(id).populate({
            
            path: 'positionCode',
        })
        if (salaryGrade && salaryGrade.isDeleted === false) {
            res.status(200).json(salaryGrade);
          } else if (salaryGrade && salaryGrade.isDeleted === true) {
            res.status(410).send("salary grade is deleted");
          } else {
            throw new NotFoundError("salary grade not found");
          }
    }catch(err){
        throw err
    }
}


const postSalaryGrade = async (req,res) =>{
    const {code, factor, positionCode } = req.body;
    try{
        const salaryGradeExist = await SalaryGrade.findOne({code}); 
        const position = Position.findById(positionCode);
        if(!position || (position&&position.isDeleted===true)){
            throw new BadRequestError("position not exist")
        }
        if(salaryGradeExist && salaryGradeExist.isDeleted===true){
            salaryGradeExist.code= code;
            salaryGradeExist.factor=factor;
            salaryGradeExist.positionCode= positionCode;
            const newSalaryGrade = await salaryGradeExist.save()
            res.status(201).json({
                message: 'restore salary grade successfully',
                salaryGrade: newSalaryGrade,
            })
        }
        else if (!salaryGradeExist){
            const salaryGrade = new SalaryGrade({code,factor,positionCode});
            const newSalaryGrade = await salaryGrade.save()
            res.status(200).json({
                message: 'Create salary grade successfully',
                salaryGrade: newSalaryGrade,
            })
        }
        else{
            throw new BadRequestError(`Salary grade with code ${salaryGradeExist.code} exist`)
        }

    }catch(err){
        throw err;
    }
}

const updateSalaryGrade = async (req,res) =>{
    const {id}= req.params;
    const {code,factor, positionCode} = req.body;
    const salaryGrade = await SalaryGrade.findById(id);
    const position = Position.findById(positionCode);

    if(!salaryGrade) {
        throw new NotFoundError('Not found salary grade');
    }
    if(!position || (position&&position.isDeleted===true)){
        throw new BadRequestError("position not exist")
    }

    salaryGrade.code= code;
    salaryGrade.factor= factor;
    salaryGrade.positionCode= positionCode;
    try{
        const updateSalaryGrade = await salaryGrade.save();
        res.status(200).json(updateSalaryGrade)
    }
    catch(err){
        throw err
    }
}

const deleteSalaryGrade = async(req,res) =>{
    const {id} = req.params;
    try{
        const salaryGrade = await SalaryGrade.findByIdAndUpdate(id,{ isDeleted: true},{new: true});
        res.status(200).json({
            message: 'Deleted salary grade successfully',
            salaryGrade: salaryGrade,
        })
    }
    catch(err){
        throw err
    }
}

export {getSalaryGrades,getSalaryGrade,postSalaryGrade,updateSalaryGrade,deleteSalaryGrade}