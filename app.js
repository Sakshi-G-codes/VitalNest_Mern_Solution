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
  InventoryRequestToIndustryBySupplier,
  InventoryRequestToSupplierByHospital,
  InventoryDataSupplierToHospital,
  InventoryDataIndustryToSupplier,
  BloodDonationData,
  BloodDonationRequests,
  BloodUnitsAvailable,
  MedicineDataForPatients,
  MedicineRepresentatives,
  NgoIdentity,
  RepOffers,
  RepVisitConfirmations,
  RepVisitRequests,
  UnregisteredMedicineData
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
  if (passwd !== user.passwd)
    return res.render('index', { error: "Incorrect Password" });
  await LogTable.create({ aadhar: String(aadhar), log_timestamp: new Date() });
  const user_type = user.user_type;
  if (user_type === "Hospital") {
    const hsp = await HspIdentity.findOne({ manager_id: aadhar });
    const hsp_id = hsp.hsp_id;
    const inven_data = await MedicineDataReplica.find({ quantity: { $ne: 0 } }).sort({ supplier_id: 1, ind_id: 1 });
    const patient_meds = await MedicineDataForPatients.find({ hsp_id, quantity: { $gt: 0 } });
    const pending_visits = await RepVisitRequests.find({ hsp_id, status: 'pending' });
    const blood_units = await BloodUnitsAvailable.find({ units: { $gt: 0 } }).sort({ blood_group: 1 });
    return res.render('hospital_dashboard', { hsp_id, data: inven_data, patient_meds, pending_visits, blood_units });
  } else if (user_type === "NGO") {
    const ngo = await NgoIdentity.findOne({ manager_id: aadhar });
    const ngo_id = ngo.ngo_id;
    const requests = await BloodDonationRequests.find({ ngo_id }).sort({ request_timestamp: -1 });
    return res.render('ngo_dashboard', { ngo_id, requests });
  } else if (user_type === "supplier") {
    const data = await MedicineData.find();
    const inventory_data = await InventoryDataIndustryToSupplier.find({ supplier_id: aadhar });
    const request_data = await InventoryRequestToSupplierByHospital.find({ supplier_id: aadhar });
    return res.render('supplier_dashboard', { data, manager_id: aadhar, inventory_data, request_data });
  } else if (user_type === "industry") {
    const ind = await IndIdentity.findOne({ manager_id: aadhar });
    const ind_id = ind.ind_id;
    const medicines = await MedicineData.find({ ind_id });
    const request_data = await InventoryRequestToIndustryBySupplier.find({ ind_id });
    return res.render('industry_dashboard', { ind_id, medicines, request_data });
  } else if (user_type === "rep") {
    const pending_offers = await RepOffers.find({ rep_id: aadhar, status: 'pending' });
    const assigned_meds = await MedicineRepresentatives.find({ rep_id: aadhar });
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
    const confirmed_visits = await RepVisitConfirmations.find({ rep_id: aadhar, status: 'confirmed' });
    return res.render("representative_dashboard", { pending_offers, assigned_meds, rep_id: aadhar, hsp_data, confirmed_visits });
  } else if (user_type === "payer") {
    return res.render("payer_dashboard", { aadhar });
  } else if (user_type === "admin") {
    const Users_data = await AclList.find({ user_type: { $ne: "admin" } });
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
    const ind_data = await IndIdentity.aggregate([
      {
        $lookup: {
          from: "acl_list",
          localField: "manager_id",
          foreignField: "aadhar",
          as: "manager"
        }
      }
    ]);
    const approval_data = await RegistrationApprovalData.find({ approval_status: 'not approved' });
    const pending_blood_requests = await BloodDonationRequests.find({ status: 'pending' }).sort({ request_timestamp: -1 });
    const approved_blood_requests = await BloodDonationRequests.find({ status: 'approved' }).sort({ request_timestamp: -1 });
    const blood_units = await BloodUnitsAvailable.find().sort({ blood_group: 1 });
    return res.render('admin_dashboard', {
      admin_id: aadhar,
      users: Users_data,
      supply: supply_data,
      hsp_data,
      ind_data,
      approval_data,
      pending_blood_requests,
      approved_blood_requests,
      blood_units
    });
  }
  return res.render('index', { error: "Password Not Matching try again...." });
});

app.get('/register', (req, res) => res.render('register'));

app.post('/registerToDB', async (req, res) => {
  const { uname, aadhar, mobile, passwd, utype } = req.body;
  if(utype === 'payer'){
    await AclList.create({
    name: uname,
    aadhar: Number(aadhar),
    mobile: Number(mobile),
    passwd: passwd,
    user_type: utype
    });
  }
  else{
  await RegistrationApprovalData.create({
    name: uname,
    aadhar: Number(aadhar),
    mobile: Number(mobile),
    passwd: passwd,
    user_type: utype
  });}
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
  const blood_groups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  if (Array.isArray(items) && Array.isArray(quantities)) {
    for (let i = 0; i < items.length; i++) {
      await PatientData.create({ p_id: aadhar, item: items[i], quantity: parseInt(quantities[i]), hsp_id });
      if (blood_groups.includes(items[i])) {
        const result = await BloodUnitsAvailable.findOne({ blood_group: items[i] });
        if (!result || result.units < parseInt(quantities[i])) {
          return res.send("Insufficient blood units available for " + items[i]);
        }
        await BloodUnitsAvailable.updateOne({ blood_group: items[i] }, { $inc: { units: -parseInt(quantities[i]) } });
      } else {
        await MedicineDataForPatients.updateOne({ hsp_id, med_name: items[i] }, { $inc: { quantity: -parseInt(quantities[i]) } });
      }
    }
  } else {
    await PatientData.create({ p_id: aadhar, item: items, quantity: parseInt(quantities), hsp_id });
    if (blood_groups.includes(items)) {
      const result = await BloodUnitsAvailable.findOne({ blood_group: items });
      if (!result || result.units < parseInt(quantities)) {
        return res.send("Insufficient blood units available for " + items);
      }
      await BloodUnitsAvailable.updateOne({ blood_group: items }, { $inc: { units: -parseInt(quantities) } });
    } else {
      await MedicineDataForPatients.updateOne({ hsp_id, med_name: items }, { $inc: { quantity: -parseInt(quantities) } });
    }
  }
  const inven_data = await MedicineDataReplica.find({ quantity: { $ne: 0 } }).sort({ supplier_id: 1, ind_id: 1 });
  const patient_meds = await MedicineDataForPatients.find({ hsp_id, quantity: { $gt: 0 } });
  const pending_visits = await RepVisitRequests.find({ hsp_id, status: 'pending' });
  const blood_units = await BloodUnitsAvailable.find({ units: { $gt: 0 } }).sort({ blood_group: 1 });
  return res.render('hospital_dashboard', { hsp_id, data: inven_data, patient_meds, pending_visits, blood_units });
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
  if (action === 'approve') {
    if (details.length > 0) {
      return res.send("User already exists with the details like this: " + details.map(row => JSON.stringify(row)).join(", "));
    }
    await AclList.create({ name, aadhar, mobile, passwd, user_type: type });
    await RegistrationApprovalData.deleteOne({ aadhar });
    return res.send("Approved Successfully");
  } else if (action === 'reject') {
    await RegistrationApprovalData.deleteOne({ aadhar });
    return res.send("Rejected Successfully");
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

app.post('/LogData', async (req, res) => {
  const { aadhar } = req.body;
  const logs = await LogTable.find({ aadhar }).sort({ log_timestamp: -1 });
  return res.render('log_data', { logs });
});

app.post('/acceptOffer', async (req, res) => {
  const { rep_id, ind_id, medicine_name, offer_amount } = req.body;
  await RepOffers.updateOne({ rep_id, ind_id, medicine_name }, { status: 'accepted' });
  await MedicineRepresentatives.create({ id: rep_id, ind_id, medicine_name, rep_id });
  return res.send("Offer accepted successfully");
});

app.post('/rejectOffer', async (req, res) => {
  const { rep_id, ind_id, medicine_name } = req.body;
  await RepOffers.updateOne({ rep_id, ind_id, medicine_name }, { status: 'rejected' });
  return res.send("Offer rejected successfully");
});

app.post('/requestVisit', async (req, res) => {
  const { rep_id, hsp_id, medicine_name } = req.body;
  const med_rep = await MedicineRepresentatives.findOne({ rep_id, medicine_name });
  if (!med_rep) return res.send("You are not assigned to this medicine");
  await RepVisitRequests.create({ rep_id, hsp_id, medicine_name, ind_id: med_rep.ind_id });
  return res.send("Visit request sent successfully");
});

app.post('/confirmVisit', async (req, res) => {
  const { rep_id, hsp_id, medicine_name, ind_id } = req.body;
  await RepVisitConfirmations.create({ rep_id, hsp_id, medicine_name, ind_id });
  await RepVisitRequests.updateOne({ rep_id, hsp_id, medicine_name }, { status: 'confirmed' });
  return res.send("Visit confirmed successfully");
});

app.post('/manageReps', async (req, res) => {
  const { ind_id } = req.body;
  const reps = await MedicineRepresentatives.find({ ind_id });
  return res.render('manage_reps', { reps, ind_id });
});

app.post('/hospitalMetrics', async (req, res) => {
  const { hsp_id, period_type, year, month, day } = req.body;
  if (!hsp_id || !period_type || !year) {
    return res.status(400).send("HSP ID, period type, and year required");
  }
  if (isNaN(parseInt(year))) {
    return res.status(400).send("Invalid year");
  }
  if (period_type === 'month' || period_type === 'day') {
    if (!month || isNaN(parseInt(month)) || parseInt(month) < 1 || parseInt(month) > 12) {
      return res.status(400).send("Valid month required for month/day");
    }
  }
  if (period_type === 'day') {
    if (!day) {
      return res.status(400).send("Valid date required for day");
    }
    const dateObj = new Date(day);
    if (isNaN(dateObj.getTime())) {
      return res.status(400).send("Invalid date format for day");
    }
  }

  let dateFilter = {};
  let period_value;
  if (period_type === 'year') {
    period_value = year;
    dateFilter = {
      $gte: new Date(parseInt(year), 0, 1),
      $lt: new Date(parseInt(year) + 1, 0, 1)
    };
  } else if (period_type === 'month') {
    period_value = `${year}-${month}`;
    dateFilter = {
      $gte: new Date(parseInt(year), parseInt(month) - 1, 1),
      $lt: new Date(parseInt(year), parseInt(month), 1)
    };
  } else if (period_type === 'day') {
    const dateObj = new Date(day);
    period_value = day;
    dateFilter = {
      $gte: dateObj,
      $lt: new Date(dateObj.getTime() + 24 * 60 * 60 * 1000)
    };
  } else {
    return res.status(400).send("Invalid period type");
  }

  const patientsAgg = await TreatmentRecord.aggregate([
    { $match: { hsp_id, date_of_visit: dateFilter } },
    { $group: { _id: "$p_id" } },
    { $group: { _id: null, count: { $sum: 1 } } }
  ]);
  const patients_count = patientsAgg.length > 0 ? patientsAgg[0].count : 0;

  const bills_count = await PatientData.find({ hsp_id, dop: dateFilter }).countDocuments();

  const quantityAgg = await PatientData.aggregate([
    { $match: { hsp_id, dop: dateFilter } },
    { $group: { _id: null, total: { $sum: "$quantity" } } }
  ]);
  const total_quantity = quantityAgg.length > 0 ? quantityAgg[0].total : 0;

  return res.render('hospital_metrics', { hsp_id, patients_count, bills_count, total_quantity, period_type, period_value });
});

app.post('/requestBloodDonationCamp', async (req, res) => {
  const { ngo_id, request_details } = req.body;
  await BloodDonationRequests.create({ ngo_id, request_details });
  return res.send("Blood donation camp request submitted successfully");
});

app.post('/approveBloodDonationRequest', async (req, res) => {
  const { id } = req.body;
  await BloodDonationRequests.updateOne({ id }, { status: 'approved' });
  return res.send("Blood donation request approved successfully");
});

app.post('/enterBloodDonationData', async (req, res) => {
  const { request_id, donor_aadhar, blood_group, tested_status } = req.body;
  await BloodDonationData.create({ request_id, donor_aadhar, blood_group, tested_status });
  if (tested_status === 'passed') {
    await BloodUnitsAvailable.updateOne({ blood_group }, { $inc: { units: 1 } }, { upsert: true });
  }
  return res.send("Blood donation data entered successfully");
});

app.post('/submitBloodDonationData', async (req, res) => {
  const { request_id, donor_aadhar, blood_group, tested_status } = req.body;
  await BloodDonationData.create({ request_id, donor_aadhar, blood_group, tested_status });
  if (tested_status === 'passed') {
    await BloodUnitsAvailable.updateOne({ blood_group }, { $inc: { units: 1 } }, { upsert: true });
  }
  return res.send("Blood donation data submitted successfully");
});

app.post('/viewBloodDonationData', async (req, res) => {
  const { request_id } = req.body;
  const donations = await BloodDonationData.find({ request_id });
  return res.render('blood_donation_data', { donations });
});

app.listen(8080, () => {
  console.log("App is listening to port 8080");
});
