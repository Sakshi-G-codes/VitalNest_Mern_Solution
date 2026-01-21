import mongoose from 'mongoose';
const { Schema } = mongoose;

const aclListSchema = new Schema({
  name: {
    type: String,
    required: true,
    maxlength: 20
  },
  aadhar: {
    type: Number, 
    required: true,
    unique: true
  },
  mobile: {
    type: Number, 
    required: true
  },
  passwd: {
    type: String,
    required: true,
    maxlength: 20
  },
  user_type: {
    type: String,
    required: true,
    maxlength: 20
  }
}, {
  collection: 'acl_list'
});

const hspIdentitySchema = new Schema({
  hsp_id: {
    type: String,
    required: true,
    length: 6  
  },
  manager_id: {
    type: Number, 
    required: true
  }
}, {
  collection: 'hsp_identity'
});

const indIdentitySchema = new Schema({
  ind_id: {
    type: String,
    required: true,
    length: 6 
  },
  manager_id: {
    type: Number, 
    required: true
  }
}, {
  collection: 'ind_identity'
});

const inventoryDataSchema = new Schema({
  supplier_id: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  item: {
    type: String,
    required: true,
    maxlength: 50
  },
  price_per_unit: {
    type: Number,
    required: true
  },
  supplied_timestamp: {
    type: Date,
    required: true,
    default: Date.now
  },
  hsp_id: {
    type: String,
    required: true,
    maxlength: 10
  },
  type_of_product: {
    type: String,
    required: true,
    maxlength: 30
  },
  ind_id: {
    type: String,
    required: true,
    length: 6 
  }
}, {
  collection: 'inventory_data'
});

const logTableSchema = new Schema({
  aadhar: {
    type: String,
    required: true,
    length: 12  
  },
  log_timestamp: {
    type: Date,
    required: true,
    default: Date.now
  }
}, {
  collection: 'log_table'
});

const treatmentRecordSchema = new Schema({
  p_id: {
    type: Number, 
    required: true
  },
  date_of_visit: {
    type: Date,
    required: true,
    default: Date.now
  },
  disease_remark: {
    type: String,
    required: true,
    maxlength: 50
  },
  treatment_remark: {
    type: String,
    required: true,
    maxlength: 50
  },
  hsp_id: {
    type: String,
    required: true,
    length: 6  
  }
}, {
  collection: 'treatment_record'
});

const medicineDataSchema = new Schema({ 
  ind_id: {
    type: String,
    required: true,
    length: 6  
  },
  medicine_name: {
    type: String,
    required: true,
    maxlength: 30
  },
  uses: {
    type: String,
    required: true,
    maxlength: 40
  },
  side_effects: {
    type: String,
    required: true,
    maxlength: 50
  },
  quantity: {
    type: Number,
    required: true,
    default:5000,
  }
}, {
  collection: 'medicine_data'
});

const patientCrowdFundingDemandSchema = new Schema({
  p_id: {
    type: String,
    required: true,
    unique: true,
    maxlength: 12
  },
  total_demand: {
    type: Number,
    required: true
  },
  required_donation: {
    type: Number,
    required: true
  },
  date_of_register: {
    type: Date,
    required: true,
    default: Date.now
  }
}, {
  collection: 'patient_crowd_funding_demand'
});

const patientDataSchema = new Schema({
  p_id: {
    type: String,
    required: true,
    length: 12 
  },
  dop: {
    type: Date,
    required: true,
    default: Date.now
  },
  item: {
    type: String,
    required: true,
    maxlength: 20
  },
  quantity: {
    type: Number,
    required: true
  },
  hsp_id: {
    type: String,
    required: true,
    length: 6
  }
}, {
  collection: 'patient_data'
});

const patientRecordsAccessedLogDataSchema = new Schema({
  hsp_id: {
    type: String,
    required: true,
    length: 6 
  },
  p_id: {
    type: String,
    required: true,
    maxlength: 12
  },
  log_timestamp: {
    type: Date,
    required: true,
    default: Date.now
  }
}, {
  collection: 'patient_records_accessed_log_data'
});

const payersCrowdFundingDataSchema = new Schema({
  p_id: {
    type: String,
    required: true,
    unique: true,
    maxlength: 12
  },
  payer_id: {
    type: String,
    required: true,
    length: 12  
  },
  paid_timestamp: {
    type: Date,
    required: true,
    default: Date.now
  },
  amount: {
    type: Number,
    required: true
  },
  gateway: {
    type: String,
    required: true,
    maxlength: 20
  }
}, {
  collection: 'payers_crowd_funding_data'
});

const registrationApprovalDataSchema = new Schema({
  name: {
    type: String,
    required: true,
    maxlength: 20
  },
  aadhar: {
    type: Number, 
    required: true,
    unique: true
  },
  mobile: {
    type: Number,
    required: true
  },
  passwd: {
    type: String,
    required: true,
    maxlength: 20
  },
  user_type: {
    type: String,
    required: true,
    maxlength: 20
  },
  request_timestamp: {
    type: Date,
    required: true,
    default: Date.now
  },
  approval_status: {
    type: String,
    default: 'Not Approved',
    maxlength: 12
  }
}, {
  collection: 'registration_approval_data'
});

const medicineDataReplicaSchema = new Schema({
  ind_id: {
    type: String,
    required: true,
    length: 6 
  },
  medicine_name: {
    type: String,
    required: true,
    maxlength: 30
  },
  quantity: {
    type: Number,
    default: 0
  },
  supplier_id: {
    type: Number, 
    default: null
  }
}, {
  collection: 'medicine_data_replica_for_hospitals'
}
);

const inventoryRequestToIndustryBySupplierSchema = new Schema({
  supplier_id: {
    type: Number,
    default: null
  },
  quantity: {
    type: Number,
    default: null
  },
  ind_id: {
    type: String,
    length: 6,
    default: null
  },
  med_name: {
    type: String,
    maxlength: 20,
    default: null
  },
  requested_timestamp: {
    type: Date,
    default: Date.now
  }
}
, {
  collection: 'inventory_request_to_industry_by_supplier'
});


const inventoryRequestToSupplierByHospitalSchema = new Schema({
  supplier_id: {
    type: Number,
    default: null
  },
  quantity: {
    type: Number,
    default: null
  },
  ind_id: {
    type: String,
    length: 6,
    default: null
  },
  med_name: {
    type: String,
    maxlength: 20,
    default: null
  },
  hsp_id: {
    type: String,
    length: 6,
    default: null
  },
  requested_timestamp: {
    type: Date,
    default: Date.now
  }
}
, {
  collection: 'inventory_request_to_supplier_by_hospital'
});
const inventoryDataIndustryToSupplierSchema = new Schema({
  supplier_id: {
    type: String,
    default: null
  },
  quantity: {
    type: Number,
    default: null
  },
  ind_id: {
    type: String,
    length: 6,
    default: null
  },
  med_name: {
    type: String,
    maxlength: 20,
    default: null
  },
  supplied_timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  collection: 'inventory_data_industry_to_supplier'
});

const inventoryDataSupplierToHospitalSchema = new Schema({
  supplier_id: {
    type: Number,
    default: null
  },
  quantity: {
    type: Number,
    default: null
  },
  hsp_id: {
    type: String,
    length: 6,
    default: null
  },
  med_name: {
    type: String,
    maxlength: 20,
    default: null
  },
  supplied_timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  collection: 'inventory_data_supplier_to_hospital'
})

const bloodDonationDataSchema = new Schema({
  id: {
    type: Number,
    required: true,
    unique: true
  },
  request_id: {
    type: Number,
    required: true
  },
  donor_aadhar: {
    type: String,
    required: true,
    maxlength: 12
  },
  blood_group: {
    type: String,
    required: true,
    enum: ['A+','A-','B+','B-','AB+','AB-','O+','O-']
  },
  tested_status: {
    type: String,
    enum: ['passed','failed','pending'],
    default: 'pending'
  },
  donation_timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  collection: 'blood_donation_data'
});

const bloodDonationRequestsSchema = new Schema({
  id: {
    type: Number,
    required: true,
    unique: true
  },
  ngo_id: {
    type: String,
    required: true,
    maxlength: 255
  },
  request_details: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending','approved','rejected'],
    default: 'pending'
  },
  request_timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  collection: 'blood_donation_requests'
});

const bloodUnitsAvailableSchema = new Schema({
  blood_group: {
    type: String,
    required: true,
    maxlength: 10
  },
  units: {
    type: Number,
    default: 0
  }
}, {
  collection: 'blood_units_available'
});

const medicineDataForPatientsSchema = new Schema({
  hsp_id: {
    type: String,
    length: 6,
    default: null
  },
  med_name: {
    type: String,
    maxlength: 20,
    default: null
  },
  quantity: {
    type: Number,
    default: null
  }
}, {
  collection: 'medicine_data_for_patients'
});

const medicineRepresentativesSchema = new Schema({
  id: {
    type: Number,
    required: true,
    unique: true
  },
  ind_id: {
    type: String,
    required: true,
    length: 6
  },
  medicine_name: {
    type: String,
    required: true,
    maxlength: 30
  },
  rep_id: {
    type: Number,
    required: true
  }
}, {
  collection: 'medicine_representatives'
});

const ngoIdentitySchema = new Schema({
  ngo_id: {
    type: String,
    required: true,
    length: 6
  },
  manager_id: {
    type: Number,
    required: true
  }
}, {
  collection: 'ngo_identity'
});

const repOffersSchema = new Schema({
  ind_id: {
    type: String,
    maxlength: 255,
    default: null
  },
  medicine_name: {
    type: String,
    maxlength: 255,
    default: null
  },
  rep_id: {
    type: Number,
    default: null
  },
  offer_amount: {
    type: Number,
    default: null
  },
  status: {
    type: String,
    maxlength: 20,
    default: 'pending'
  }
}, {
  collection: 'rep_offers'
});

const repVisitConfirmationsSchema = new Schema({
  rep_id: {
    type: Number,
    required: true
  },
  hsp_id: {
    type: String,
    required: true,
    maxlength: 255
  },
  medicine_name: {
    type: String,
    required: true,
    maxlength: 255
  },
  ind_id: {
    type: String,
    required: true,
    maxlength: 255
  },
  status: {
    type: String,
    enum: ['pending','confirmed'],
    default: 'pending'
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  collection: 'rep_visit_confirmations'
});

const repVisitRequestsSchema = new Schema({
  rep_id: {
    type: Number,
    required: true
  },
  hsp_id: {
    type: String,
    required: true,
    maxlength: 255
  },
  medicine_name: {
    type: String,
    required: true,
    maxlength: 255
  },
  status: {
    type: String,
    enum: ['pending','confirmed'],
    default: 'pending'
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  collection: 'rep_visit_requests'
});

const unregisteredMedicineDataSchema = new Schema({
  ind_id: {
    type: String,
    required: true,
    length: 6
  },
  medicine_name: {
    type: String,
    required: true,
    maxlength: 30
  },
  uses: {
    type: String,
    required: true,
    maxlength: 40
  },
  side_effects: {
    type: String,
    required: true,
    maxlength: 50
  },
  unregistered_timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  collection: 'unregistered_medicine_data'
});


const BloodDonationData = mongoose.model('BloodDonationData', bloodDonationDataSchema);
const BloodDonationRequests = mongoose.model('BloodDonationRequests', bloodDonationRequestsSchema);
const BloodUnitsAvailable = mongoose.model('BloodUnitsAvailable', bloodUnitsAvailableSchema);
const MedicineDataForPatients = mongoose.model('MedicineDataForPatients', medicineDataForPatientsSchema);
const MedicineRepresentatives = mongoose.model('MedicineRepresentatives', medicineRepresentativesSchema);
const NgoIdentity = mongoose.model('NgoIdentity', ngoIdentitySchema);
const RepOffers = mongoose.model('RepOffers', repOffersSchema);
const RepVisitConfirmations = mongoose.model('RepVisitConfirmations', repVisitConfirmationsSchema);
const RepVisitRequests = mongoose.model('RepVisitRequests', repVisitRequestsSchema);
const UnregisteredMedicineData = mongoose.model('UnregisteredMedicineData', unregisteredMedicineDataSchema);

const InventoryDataSupplierToHospital = mongoose.model('InventoryDataSupplierToHospital', inventoryDataSupplierToHospitalSchema);
const InventoryDataIndustryToSupplier = mongoose.model('InventoryDataIndustryToSupplier', inventoryDataIndustryToSupplierSchema);
const TreatmentRecord = mongoose.model('TreatmentRecord', treatmentRecordSchema);
const HspIdentity = mongoose.model('HspIdentity', hspIdentitySchema)
const IndIdentity = mongoose.model('IndIdentity', indIdentitySchema)
const InventoryData = mongoose.model('InventoryData', inventoryDataSchema)
const AclList = mongoose.model('AclList', aclListSchema)
const LogTable = mongoose.model('LogTable', logTableSchema)
const MedicineData = mongoose.model('MedicineData', medicineDataSchema)
const PatientCrowdFundingDemand = mongoose.model('PatientCrowdFundingDemand', patientCrowdFundingDemandSchema)
const PatientData = mongoose.model('PatientData', patientDataSchema)
const PatientRecordsAccessedLogData = mongoose.model('PatientRecordsAccessedLogData', patientRecordsAccessedLogDataSchema)
const PayersCrowdFundingData = mongoose.model('PayersCrowdFundingData', payersCrowdFundingDataSchema)
const RegistrationApprovalData = mongoose.model('RegistrationApprovalData', registrationApprovalDataSchema)
const MedicineDataReplica = mongoose.model('MedicineDataReplicaForHospitals', medicineDataReplicaSchema);
const InventoryRequestToIndustryBySupplier = mongoose.model('InventoryRequestToIndustryBySupplier', inventoryRequestToIndustryBySupplierSchema);
const InventoryRequestToSupplierByHospital = mongoose.model('InventoryRequestToSupplierByHospital', inventoryRequestToSupplierByHospitalSchema);


export {
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
  InventoryDataIndustryToSupplier,
  InventoryDataSupplierToHospital,
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
};
