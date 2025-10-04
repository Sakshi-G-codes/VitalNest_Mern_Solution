import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import path from "path";

import {
  AclList,
  HspIdentity,
  IndIdentity,
  InventoryData,
  TreatmentRecord,
  LogTable,
  MedicineData,
  PatientCrowdFundingDemand,
  PatientData,
  PatientRecordsAccessedLogData,
  PayersCrowdFundingData,
  RegistrationApprovalData,
  MedicineDataReplica,
  inventoryDataIndustryToSupplier
} from "./models/models.js";

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static("public"));

app.set('view engine', 'ejs');
app.set('views', './views');

mongoose.connect('mongodb://127.0.0.1:27017/vital_nest_mern_solution');
console.log("Connected to MongoDB successfully");

app.get('/', (req, res) => res.render('index'));

app.post('/login', async (req, res) => {
  let { aadhar, passwd } = req.body;
  aadhar = Number(aadhar);
  console.log(aadhar);
  console.log(passwd);
  const user = await AclList.findOne({ aadhar });
  console.log(user);
  if (!user) 
    return res.render('index', { error: "User not Found" });
  if (user.passwd !== passwd) 
    return res.render('index', { error: "Incorrect Password" });
  await LogTable.create({ aadhar : String(aadhar), log_timestamp: new Date() });
  if (user.user_type === 'Hospital') {
    const hsp = await HspIdentity.findOne({ manager_id: aadhar });
    const hsp_id = hsp ? hsp.hsp_id : '';
    const inven_data = await mongoose.connection.collection('medicine_data_replica_for_hospitals').find({ quantity: { $ne: 0 } }).sort({ supplier_id: 1, ind_id: 1 }).toArray();
    return res.render('hospital_dashboard', { hsp_id, data: inven_data });
  }
  else if (user.user_type === 'supplier') {
    const data = await MedicineData.find();
    const inventory_data = await mongoose.connection.collection('inventory_data_industry_to_supplier').find({ supplier_id: aadhar }).toArray();
    const request_data = await mongoose.connection.collection('inventory_request_to_supplier_by_hospital').find({ supplier_id: aadhar }).toArray();
    return res.render('supplier_dashboard', { data, manager_id: aadhar, inventory_data, request_data });
  } 
  else if (user.user_type === 'industry') {
    const ind = await IndIdentity.findOne({ manager_id: aadhar });
    const ind_id = ind ? ind.ind_id : '';
    const medicines = await MedicineData.find({ ind_id });
    const request_data = await mongoose.connection.collection('inventory_request_to_industry_by_supplier').find({ ind_id }).toArray();
    return res.render('industry_dashboard', { ind_id, medicines, request_data });
  } 
  else if (user.user_type === 'rep') {
    return res.render("representative_dashboard");
  }else if(user.user_type === 'payer'){
    return res.render("payer_dashboard");
  } 
  else if (user.user_type === 'admin') {
    const Users_data = await AclList.find({ user_type: { $ne: "admin" } });
    const Log_data = await LogTable.find().sort({ log_timestamp: -1 });
    const supply_data = await InventoryData.find().sort({ hsp_id: 1, supplier_id: 1, supplied_timestamp: -1 });
    const hsp_data = await HspIdentity.aggregate([
      {
        $lookup: {
          from: "acl_list",
          localField: "manager_id",
          foreignField: "aadhar",
          as: "manager"
        }
      }
    ]);
const approval_data = await RegistrationApprovalData.find(
  { approval_status: 'not approved' },
  'name aadhar mobile user_type request_timestamp passwd'
);
return res.render('admin_dashboard', {
    admin_id: aadhar,
    users: Users_data,
    logs: Log_data,
    supply: supply_data,
    hsp_data,
    approval_data
    });
  }
  return res.render('index', { error: "Password Not Matching try again...." });
});

app.get('/register', (req, res) => res.render('register'));

app.post('/registerToDB', async (req, res) => {
  const { uname, aadhar, mobile, passwd, utype } = req.body;
  await RegistrationApprovalData.create({
    name: uname,
    aadhar,
    mobile,
    passwd,
    user_type: utype,
    approval_status: "not approved",
    request_timestamp: new Date()
  });
  return res.redirect('/');
});

app.post('/newMedicine', async (req, res) => {
  const { med_name, uses, side_effects, ind_id } = req.body;
  await MedicineData.create({ ind_id, medicine_name: med_name, uses, side_effects });
  const sup_ids = await AclList.find({ user_type: "supplier" }).select("aadhar");
  console.log(sup_ids);
  for (let sup of sup_ids) {
    await mongoose.connection.collection('medicine_data_replica_for_hospitals')
      .insertOne({ ind_id, medicine_name: med_name, supplier_id: sup.aadhar });
  }
  return res.redirect('/');
});

app.post('/billPatient', async (req, res) => {
  console.log("Entered bill Patient end point");
  console.log(req.body);
  const { hsp_id, aadhar } = req.body;
  const items = req.body.item;
  const quantities = req.body.quantity;
  if (Array.isArray(items) && Array.isArray(quantities)) {
    for (let i = 0; i < items.length; i++) {
      await PatientData.create({ p_id: aadhar, item: items[i], quantity: parseInt(quantities[i]), hsp_id });
    }
  } else {
    await PatientData.create({ p_id: aadhar, item: items, quantity: parseInt(quantities), hsp_id });
  }
  return res.render('hospital_dashboard', { hsp_id });
});

app.post('/addTreatmentRecord', async (req, res) => {
  const { hsp_id, p_id, disease_remark, treatment_remark } = req.body;
  await TreatmentRecord.create({ p_id, disease_remark, treatment_remark, hsp_id });
  return res.render('hospital_dashboard', { hsp_id });
});

app.post('/patientRecords', async (req, res) => {
  const { aadhar, hsp_id } = req.body;
  const records = await TreatmentRecord.find({ p_id: aadhar });
  await PatientRecordsAccessedLogData.create({ hsp_id, p_id: aadhar });
  return res.render('patient_records', { hsp_id, records });
});

app.post('/patientRecordsLogData', async (req, res) => {
  const { aadhar } = req.body;
  const records = await PatientRecordsAccessedLogData.find({ p_id: aadhar });
  return res.render('patient_records_logs', { records });
});

app.post('/viewPatientBills',async (req,res) => {
  const { aadhar,hsp_id } = req.body;
  const records = await PatientData.find({p_id : aadhar});
  return res.render('patient_bills',{ records,hsp_id });
});

app.post('/createCrowdfundingDemand', async(req,res) => {
  const { aadhar,total_demand,required_donation } = req.body;
  await PatientCrowdFundingDemand.create({p_id : aadhar , total_demand : total_demand , required_donation : required_donation });
  const demands = await PatientCrowdFundingDemand.find();
  return res.render('crowdfunding_demands',{demands}); 
});

app.get('/viewCrowdfundingDemands' , async(req,res) => {
  const demands = await PatientCrowdFundingDemand.find();
  return res.render('crowdfunding_demands',{demands});
});

app.post('/payCrowdfunding',async(req,res) => {
  const {aadhar,payer_id ,amount,gateway} = req.body;
  console.log(req.body);
  await PayersCrowdFundingData.create({p_id : aadhar ,payer_id : payer_id ,paid_timestamp : new Date(),amount : amount,gateway :gateway});
  return res.render('payer_dashboard');
});

app.post('/approveUser', async (req, res) => {
  const { name, aadhar, mobile, type, passwd, action } = req.body;
  const details = await AclList.find({ aadhar });
  if (details.length > 0 && action === 'approve') {
    return res.send("User already exists with the details like this: " + details.map(row => JSON.stringify(row)).join(", "));
  } else if (action === 'reject') {
    await RegistrationApprovalData.deleteOne({ aadhar });
    return res.send("Rejected Successfully");
  } else {
    await AclList.create({ name, aadhar, mobile, passwd, user_type: type });
    await RegistrationApprovalData.deleteOne({ aadhar });
    return res.send("Approved Successfully");
  }
});

app.post('/updateMedicineQuantity', async (req, res) => {
  const { quant, quant_update, name } = req.body;
  const updated_quantity = parseInt(quant) + parseInt(quant_update);
  await MedicineData.updateOne({ medicine_name: name }, { quantity: updated_quantity });
  return res.send("Update Successfull");
});

app.post('/removeMedicine', async (req, res) => {
  const { name } = req.body;
  const med = await MedicineData.findOne({ medicine_name: name });
  if (!med) return res.send("Medicine not found");
  await mongoose.connection.collection('unregistered_medicine_data').insertOne({
    ind_id: med.ind_id,
    medicine_name: med.medicine_name,
    uses: med.uses,
    side_effects: med.side_effects
  });
  await MedicineData.deleteOne({ medicine_name: name });
  return res.send("Medicine Unregistering Successful");
});

app.post('/requestInventory', async (req, res) => {
  const { supplier_id, quantity, ind_id, med_name } = req.body;
  const requested_timestamp = new Date();
  await mongoose.connection.collection('inventory_request_to_industry_by_supplier').insertOne({
    supplier_id, quantity, ind_id, med_name, requested_timestamp, 
  });
  return res.send("Inventory Request fetch is successful");
});

app.post('/sendInventory', async (req, res) => {
  const { supplier_id, ind_id, med_name, quantity, action } = req.body;
  console.log(req.body);
  if (action === "approve") {
    await MedicineData.updateOne({ ind_id, medicine_name: med_name }, { $inc: { quantity: -parseInt(quantity) } });
    await mongoose.connection.collection('inventory_data_industry_to_supplier').insertOne({
      supplier_id, quantity: parseInt(quantity), ind_id, med_name
    });
    await mongoose.connection.collection('medicine_data_replica_for_hospitals').updateMany(
      { supplier_id }, { $inc: { quantity: parseInt(quantity) } });
    await mongoose.connection.collection('inventory_request_to_industry_by_supplier').deleteOne({ supplier_id, med_name });
    return res.send("Send Inventory data is Successful");
  } else {
    await mongoose.connection.collection('inventory_request_to_industry_by_supplier').deleteOne({ supplier_id, med_name });
    return res.send("Send Inventory data is Successful");
  }
});

app.post('/requestInventoryByHospital', async (req, res) => {
  const { supplier_id, quant, ind_id, med_name, hsp_id } = req.body;
  await mongoose.connection.collection('inventory_request_to_supplier_by_hospital').insertOne({
    supplier_id, quantity: parseInt(quant), ind_id, med_name, hsp_id
  });
  return res.send("Inventory Request fetch from hospital is successful");
});

app.post('/sendInventoryToHospital', async (req, res) => {
  const { supplier_id, hsp_id, med_name, quantity, action } = req.body;
  if (action === "approve") {
    await mongoose.connection.collection('medicine_data_replica_for_hospitals').updateOne(
      { supplier_id, medicine_name: med_name }, { $inc: { quantity: -parseInt(quantity) } });
    await mongoose.connection.collection('inventory_data_supplier_to_hospital').insertOne({
      supplier_id, quantity: parseInt(quantity), hsp_id, med_name
    });
    await mongoose.connection.collection('inventory_request_to_supplier_by_hospital').deleteOne({ hsp_id, med_name });
    return res.send("Send Inventory data by Hospital is Successful");
  } 
  else {
    await mongoose.connection.collection('inventory_request_to_supplier_by_hospital').deleteOne({ hsp_id, med_name });
    return res.send("Send Inventory data by Hospital is Successful");
  }
});

app.listen(8080, () => {
  console.log("App is listening to port 8080");
});
