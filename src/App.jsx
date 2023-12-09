import React,{ useEffect, useState } from 'react'
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import { useFormik} from 'formik';
import * as Yup from 'yup';
import { Icon } from '@mui/material';

function Eb(){
  const [value, setValue] =useState('1');
  const [billdata,setbilldata]=useState([]);
  const [srow,setsrow]=useState('')
  const [unit,setunit]=useState('');
  const [price,setprice]=useState('');
  const [showTable, setShowTable] = useState(false);
  const [paydata,setpaydata]=useState([])

  const uniqueEbNos = [...new Set(billdata.map((item) => item.ebNo))];
  const data =JSON.parse(localStorage.getItem('billlist')) 

  const handleEbNoChange = (event) => {
    const selectedEbNo = event.target.value;
    const selectedBillData = billdata.find((item) => item.ebNo === selectedEbNo);

    if (selectedBillData) {
      document.getElementById('date1').value = selectedBillData.date;
      document.getElementById('price').value = selectedBillData.price;
    }
    const uniqueMonths = [...new Set(billdata.filter((item) => item.ebNo === selectedEbNo).map((item) => item.date))];
    const dateDropdown = document.getElementById('date1');

    // Clear existing options
    while (dateDropdown.firstChild) {
      dateDropdown.removeChild(dateDropdown.firstChild);
    }

    // Populate the Month dropdown
    uniqueMonths.forEach((month, index) => {
      const option = document.createElement('option');
      option.value = month;
      option.text = new Date(month).toLocaleString('default', { month: 'long' }); // Display month name
      dateDropdown.add(option);
    });
  
    dateDropdown.addEventListener('change', (event) => {
    const selectedMonth = document.getElementById('date1').value;
    const selectedData = billdata.find((item) => item.ebNo === selectedEbNo && item.date === selectedMonth);

    
  if (selectedData) {
    setprice(selectedData.price);
    formik.setFieldValue('price', selectedData.price);
  }
});
  };
  const handleReset = () => {
    formik.handleReset();
  };

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  useEffect(() => {
     
    if (srow) {
      formik.setValues({
        date: srow.date,
        ebno: srow.ebNo,
        unit: srow.unit,
        price:srow.price,
      });
      setunit(srow.unit)
      setprice(srow.price)
    }
  }, [srow,billdata,paydata]);
  useEffect(()=>{
    fetchAndShowTableData()
    fetchPaymentDataAndShowTable();
  },[])

  const validationSchema = Yup.object().shape({
    date: Yup.date().required('Date is required'),
    ebno: Yup.string().required('EB Number is required'),
    unit: Yup.number().required('Unit is required').min(0, 'Unit must be greater than or equal to 0'),
    price: Yup.number().required('Price is required').min(0, 'Price must be greater than or equal to 0'),
  });
  const formik = useFormik({
    initialValues: {
      date: '',
      ebno: '',
      unit: unit,
      price: price,
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      handleSave(values);
    },
  });
  const handleSave=(values)=>{  
  const formData={
      date: values.date,
      ebNo: values.ebno,
      unit: values.unit,
      price: values.price,
    };
    const existingEntry = billdata.find(
      (item) =>
        item.ebNo === formData.ebNo &&
        new Date(item.date).getMonth() === new Date(formData.date).getMonth() &&
        new Date(item.date).getFullYear() === new Date(formData.date).getFullYear()
    );
  
    if (existingEntry) {
      alert('An entry with the same EB Number and month or date already exists!');
      return; // Do not proceed further if there's a matching entry
    }
  setunit('')
  setprice('')
  setbilldata([...billdata, formData]);
    const currentBillList = getBillListFromLocalStorage();
    saveBillListToLocalStorage([...currentBillList, formData]);
    savePaymentToLocalStorage({});
    formik.resetForm();
};
const unittoprice=(e)=>{
  let u=e.target.value
  formik.setFieldValue('unit', u);
  setunit(u);
  let p=0;
  if (u > 100) {
    p = (u - 100) * 10;
  }
  setprice(p.toFixed(2));
  formik.setFieldValue('price', p.toFixed(2));
}

function clearformm(){
  formik.handleReset()
  setprice('')
}
const saveBillListToLocalStorage = (data) => {
  localStorage.setItem('billlist', JSON.stringify(data));
};
// Function to get bill list data from localStorage
const getBillListFromLocalStorage = () => {
  const data = localStorage.getItem('billlist');
  return data ? JSON.parse(data) : [];
};

const fetchAndShowTableData = () => {
  const storedData = getBillListFromLocalStorage();
  setbilldata(storedData);
  setShowTable(true);
};
const handleDelete = (index) => {
  const updatedData = billdata.filter((_, i) => i !== index);
  setbilldata(updatedData);
  saveBillListToLocalStorage(updatedData);
};
const handleedit =(i) => {
  console.log(i);
  setsrow(i);

  
  document.getElementById('btn1').style.display = 'none';
  formik.setValues({
    date: i.date,
    ebno: i.ebNo,
    unit: i.unit,
    price: i.price,
  });
};
// console.log(srow)
// console.log(srow.unit)

function page2check(ebNo,selectedDate,month,price){
  if(ebNo==""||selectedDate==""||month==""||price==""){
    alert("Please fill all the fields!!")
    return true;
  }
  else
      return false;
}

const handlepayment = () => {
  const ebNo = document.getElementById('ebno1').value;
  const selectedDate = new Date(document.getElementById('date1').value);
  const month = selectedDate.toLocaleString('default', { month: 'long' });
  const price = document.getElementById('price').value;
  if(page2check(ebNo,selectedDate,month,price)){
    return ;
  }
  const isDuplicateEntry = paydata.some(
    (item) => item.ebNo === ebNo && item.month === month
  );

  if (isDuplicateEntry) {
    alert('Payment entry for the same EB No and month already exists!');
    return;
  }
  const paymentData = {
    ebNo: ebNo,
    month: month,
    price: price,
    status: 'PAID',
  };

 
  let paymentList = getPaymentFromLocalStorage();
  if (!Array.isArray(paymentList)) {
    paymentList = [];
  }
  paymentList.push(paymentData); 
  savePaymentToLocalStorage(paymentList);
  setpaydata(paymentList);
 
  // const tableBody = document.getElementById('testbody1');
  // const newRow = document.createElement('tr');
  // newRow.innerHTML = `
  //   <td>${paymentData.ebNo}</td>
  //   <td>${paymentData.month}</td>
  //   <td>${paymentData.price}</td>
  //   <td><button class="btn btn-outline-success">Paid</button></td>
  // `;
  // tableBody.appendChild(newRow);
};
const savePaymentToLocalStorage = (data) => {
  localStorage.setItem('payment', JSON.stringify(data));
};
const getPaymentFromLocalStorage = () => {
  const data = JSON.parse(localStorage.getItem('payment'))||[];
  return data 
};
 
function updatefunction() {
  let upid = data.findIndex((item) => item.date === srow.date && item.ebNo === srow.ebNo);
  if(upid !== -1)
  data[upid].ebNo=formik.values.ebno
  data[upid].date=formik.values.date
  data[upid].unit=formik.values.unit
  data[upid].price=formik.values.price
  setsrow('');
  setbilldata([...data]);
  console.log(data);
  localStorage.setItem('billlist', JSON.stringify(data));
}
const fetchPaymentDataAndShowTable = () => {
  const paymentList = getPaymentFromLocalStorage();
  // const tableBody = document.getElementById('testbody1');
  // tableBody.innerHTML = ''; 
  
  // paymentList.forEach((payment) => {
  //   const newRow = document.createElement('tr');
  //   newRow.innerHTML = `
  //     <td>${payment.ebNo}</td>
  //     <td>${payment.month}</td>
  //     <td>${payment.price}</td>
  //     <td>${payment.status}</td>
  //   `;
  //   tableBody.appendChild(newRow);
  // });
   setpaydata(paymentList);
};

return(<>
<Box sx={{ width: '100%', typography: 'body1' }}>
      <TabContext value={value}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <TabList onChange={handleChange} aria-label="lab API tabs example">
            <Tab label="Home" value="1" />
            <Tab label="Bill List" value="2" />
            <Tab label="Payment" value="3" />
          </TabList>
        </Box>
        <TabPanel value="1"><div
  className="tab-pane fade show active"
  id="home-tab-pane"
  role="tabpanel"
  aria-labelledby="home-tab"
  tabIndex={0}
>
  <div className="container mt-5">
    <div className="centered">
      <h2 className="display-7"><center>Welcome to TamilNadu ElectricBill Payment</center></h2>
    </div>
  </div>
</div></TabPanel>
        <TabPanel value="2">
      
  <div className="container mt-3">        
    <form id="ebbill" onSubmit={formik.handleSubmit} onReset={clearformm}>
      <div className="form-group my-2 row">
        <div className="col-sm-3 my-2">
          <b>Date &amp; Month:</b>
          <input
            type="date"
            className="form-control"
            id="date"
            name="date"
            onChange={formik.handleChange}
            value={formik.values.date}
          />
          {formik.touched.date && formik.errors.date ? (
                    <div className="text-danger">{formik.errors.date}</div>
                  ) : null}
        </div>
        <div className="col-sm-3 my-2">
          <b>EB NO:</b>
          <input
            type="text"
            className="form-control"
            id="ebno"
            placeholder="Enter EB Number"
            name="ebno"
            onChange={formik.handleChange}
            value={formik.values.ebno}
          />
          {formik.touched.ebno && formik.errors.ebno ? (
                    <div className="text-danger">{formik.errors.ebno}</div>
                  ) : null}
        </div>
        <div className="col-sm-3 my-2">
          <b>Unit(Watts):</b>
          <input
            type="number"
            className="form-control no-spinner"
            id="unit" 
            value={formik.values.unit}
            onChange={(e)=> unittoprice(e)}
            placeholder="Enter unit(Watts)"
            name="unit"
          />
          {formik.touched.unit && formik.errors.unit ? (
                    <div className="text-danger">{formik.errors.unit}</div>
                  ) : null}
        </div>
        <div className="col-sm-3 my-2">
          <b>Price:</b>
          <input
            type="text"
            className="form-control"
            id="price"
            value={price}
            placeholder="Enter Price"
            name="price"
            readOnly
          />
          {formik.touched.price && formik.errors.price ? (
                    <div className="text-danger">{formik.errors.price}</div>
                  ) : null}
        </div>
      </div>
      <div className="text-end">
        {!showTable && (
              <button className="btn btn-primary me-md-2 " id="btn6" type="button" onClick={fetchAndShowTableData}>
                showtable
              </button>
              )}
              <button className="btn btn-primary me-md-2 " id="btn1" type="submit">
                Save
              </button>
              <button type="reset" className="btn btn-danger">
                Clear
              </button>
                <button
                  className="btn btn-primary mx-1" type='button'
                  onClick={updatefunction}
                  style={{display:srow ? 'inline-block':'none'}}
                >
                  Update
                </button>
              
            </div>
    </form>
    
    <br />
    <div className="container">
      <div className="table-responsive">
      {showTable && billdata.length>0 && (
        <table className="table" id="show">
        <thead>
          <tr>
            <th>Date &amp; Month</th>
            <th>EB NO</th>
            <th>Unit(Watts)</th>
            <th>Price</th>
            <th>Payment status</th>
            <th>Action</th> {/* Edit and Delete buttons */}
          </tr>
        </thead>
        <tbody id="testbody">{/* Data will be inserted here */}
        {billdata.map((item,index)=>(
          <tr key={index}>
            <td>{item.date}</td>
            <td>{item.ebNo}</td>
            <td>{item.unit}</td>
            <td>{item.price}</td>
            <td>{"NULL"}</td>
           <td>
        <button
          className="btn btn-primary mx-1"
          onClick={() => handleedit(item)}
        >
          Edit
        </button>
    
      <button
        className="btn btn-danger mx-1"
        onClick={() => handleDelete(index)}
      >
        Delete
      </button>
    </td>
  </tr>
))}
        </tbody>
      </table>
      )}
        
      </div>
    </div>
  </div>

</TabPanel>
        <TabPanel value="3"><div className="container mt-3">
  <form id="ebbill1">
    <div className="form-group my-2 row">
      <div className="col-sm-4 my-2">
        <b>EB NO:</b>
        <select className="form-select" id="ebno1" name="ebno" onChange={handleEbNoChange}>
          <option value="">-SELECT-</option>
         {/* Populate the unique EB number dropdown */}
         {uniqueEbNos.map((ebNo, index) => (
                    <option key={index} value={ebNo}>
                      {ebNo}
                    </option>
                  ))}
        </select>
      </div>
      <div className="col-sm-4 my-2">
        <b>Month:</b>
        <select className="form-select" id="date1" name="date">
          <option value="">-SELECT-</option>
          {/* Filter months based on the selected EB number */}
          {billdata
                    .filter((item) => item.ebNo === formik.values.ebno)
                    .map((item, index) => (
                      <option key={index} value={item.date}>
                        {item.date}
                      </option>
                    ))}
        </select>
      </div>
      <div className="col-sm-4 my-2">
        <b>Price:</b>
        <input
          type="text"
          className="form-control"
          id="price"
          placeholder="Enter Price"
          name="price"
          value={formik.values.price}
        />
      </div>
    </div>
    <div className="col-sm-12 text-end">
      <button type="button" className="btn btn-success" id="btn3" onClick={handlepayment}>
        <i className="fa-solid fa-floppy-disk" style={{ color: "#6691db" }} />
        Pay
      </button>&nbsp;&nbsp;&nbsp;
      <button type="reset" className="btn btn-danger" onClick={handleReset}>
        Cancel
      </button>
    </div>
  </form>
  <div className="container">
    <div className="table-responsive">
      <table className="table" id="show1">
        <thead>
          <tr>
            <th>EB-No</th>
            <th>Month</th>
            <th>Price</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody id="testbody1">
        {paydata.length>0 && paydata.map((item,index)=>(
          <tr key={index}>
            <td>{item.ebNo}</td>
            <td>{item.month}</td>
            <td>{item.price}</td>
            <td>{item.status}</td>
  </tr>
))}
        </tbody>
      </table>
    </div>
  </div>
</div>
</TabPanel>
      </TabContext>
    </Box>


</>)};
export default Eb;