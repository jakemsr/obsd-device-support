'use client'

import { useState, ChangeEvent, useEffect } from 'react';
import { toast } from 'sonner';
import { support_type } from '@/app/generated/prisma/enums'
import { Button, LoadingSpinner } from '@/app/components/Button';
import { checkAuth, reportSumbission } from './actions';
import { InitialActionState } from '@/lib/local-types';


export default function Page() {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  interface valueField {
    value: string;
  }

  const [issueFields, setIssueFields] = useState<valueField[]>([{ value: '' }]);
  const [otherNameVendorFields, setOtherNameVendorFields] = useState<valueField[]>([{ value: '' }]);
  const [otherNameProductFields, setOtherNameProductFields] = useState<valueField[]>([{ value: '' }]);

  const handleIssueChange = (index: number, event: ChangeEvent<HTMLTextAreaElement>) => {
    const data = [...issueFields];
    data[index].value = event.target.value;
    setIssueFields(data);
  };

  const handleOtherNameVendorChange = (index: number, event: ChangeEvent<HTMLInputElement>) => {
    const data = [...otherNameVendorFields];
    data[index].value = event.target.value;
    setOtherNameVendorFields(data);
  };

   const handleOtherNameProductChange = (index: number, event: ChangeEvent<HTMLInputElement>) => {
    const data = [...otherNameProductFields];
    data[index].value = event.target.value;
    setOtherNameProductFields(data);
  };
 
  const addIssueField = () => {
    setIssueFields([...issueFields, { value: '' }]);
  };

  const addOtherNameField = () => {
    setOtherNameVendorFields([...otherNameVendorFields, { value: '' }]);
    setOtherNameProductFields([...otherNameProductFields, { value: '' }]);
  };

  const removeIssueField = (index: number) => {
    const data = [...issueFields];
    data.splice(index, 1);
    setIssueFields(data);
  };  

  const removeOtherNameField = (index: number) => {
    let data = [...otherNameVendorFields];
    data.splice(index, 1);
    setOtherNameVendorFields(data);

    data = [...otherNameProductFields];
    data.splice(index, 1);
    setOtherNameProductFields(data);
  };  
  
  useEffect(() => {
    const fetchUserId = async () => {
      const userId = await checkAuth();
      setUserId(userId);
      setLoading(false);
    };
    fetchUserId();
  }, []);

  if (loading) {
    return <div className="px-4">Loading...</div>;
  } else if (userId === null) {
    return <div className="px-4 text-error">Please log in to submit a report.</div>;
  }

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    const formData = new FormData(event.currentTarget);
    const result = await reportSumbission(InitialActionState, formData);
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.error + ": " + result.message);
    }
    setSubmitting(false);
  };


  return (
    <div className="px-4">

      <h1 className="text-2xl font-bold text-center mb-4">
        Submit Device Report
      </h1>
      <form onSubmit={handleSubmit}>
        <input type="hidden" name="user_id" value={userId} />

        <div className="grid grid-cols-2 gap-2 max-w-fit">

          <div className="font-bold">Bus</div>
          <div>
            <select name="bus">
              <option value="usb">USB</option>
              <option value="pci">PCI</option>
            </select>
          </div>

          <div className="font-bold">Vendor ID</div>
          <div>
            <input type="text" name="vendor_id" />
          </div>

          <div className="font-bold">Product ID</div>
          <div>
            <input type="text" name="product_id" />
          </div>

          <div className="font-bold">Vendor Name</div>
          <div>
            <input type="text" name="reported_vendor" />
          </div>

          <div className="font-bold">Product Name</div>
          <div>
            <input type="text" name="reported_product" />
          </div>

          <div className="font-bold">Driver</div>
          <div>
            <input type="text" name="reported_driver" />
          </div>

          <div className="font-bold">Support Status</div>
          <div>
            <select name="support_status">
              {Object.values(support_type).map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div className="font-bold col-span-2 text-left">Issues</div>
          {issueFields.map((field, index) => (
            <div key={index} className="col-span-2 flex gap-2">
              <textarea
                name={`issue${index}`}
                value={field.value}
                onChange={(e) => handleIssueChange(index, e)}
                className="w-[80%]"
              />
              <Button
                type="button"
                onClick={() => removeIssueField(index)}
              >
                Remove
              </Button>
            </div>
          ))}
          <input type="hidden" name="numIssues" value={issueFields.length} />
          <div className="col-span-2">
            <Button type="button" onClick={addIssueField}>
              Add Another Issue
            </Button>
          </div>

          <div className="font-bold col-span-2 text-left">Other Names</div>
          {otherNameVendorFields.map((field, index) => (
            <div key={index} className="col-span-2 flex items-center gap-2">
              Vendor
              <input
                type="text"
                name={`otherNameVendor${index}`}
                value={otherNameVendorFields[index].value}
                onChange={(e) => handleOtherNameVendorChange(index, e)}
                className="w-[40%]"
              />
              Product
              <input
                type="text"
                name={`otherNameProduct${index}`}
                value={otherNameProductFields[index].value}
                onChange={(e) => handleOtherNameProductChange(index, e)}
                className="w-[40%]"
              />
              <Button
                type="button"
                onClick={() => removeOtherNameField(index)}
              >
                Remove
              </Button>
            </div>
          ))}
          <input type="hidden" name="numOtherNames" value={otherNameVendorFields.length} />
          <div className="col-span-2">
            <Button type="button" onClick={addOtherNameField}>
              Add Another Other Name
            </Button>
          </div>

          <div className="col-span-2 flex justify-center">
            <Button type="submit" disabled={submitting}>
              {submitting && <LoadingSpinner />}
              Submit Report
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
