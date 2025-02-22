import React, {
  ChangeEvent,
  Dispatch,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import { useUserContext } from "../../contexts/UserContext";
import { toast } from "react-toastify";
import axios, { AxiosResponse } from "axios";
import { colorSecondary, storageUrl, url } from "../../assets/constants";
import { handleError } from "../../assets/helperFunctions";
import ReactModal from "react-modal";
import Loading from "react-loading";
import Select from "../../components/Select";
import imageCompression from "browser-image-compression";

type Props = {
  show: boolean;
  setShow: Dispatch<SetStateAction<boolean>>;
  editId: number;
  setEditId: Dispatch<SetStateAction<number>>;
  onSave: () => void;
};

type Option = {
  label: string;
  value: string;
};

const initialValue = {
  contact_id: "",
  purpose_id: "",
  description: "",
  response: "",
  user_id: 1,
};

const AddEditVisit: React.FC<Props> = ({
  show,
  setShow,
  editId,
  setEditId,
  onSave,
}) => {
  const { user } = useUserContext();
  const [data, setData] = useState({ ...initialValue, user_id: user?.id });
  const [loading, setLoading] = useState(false);
  const [contactOptions, setContactOptions] = useState<Option[]>([]);
  const [selectedContact, setSelectedContact] = useState<Option | null>(null);
  const [purposeOptions, setPurposeOptions] = useState<Option[]>([]);
  const [selectedPurpose, setSelectedPurpose] = useState<Option | null>(null);
  const [images, setImages] = useState<
    { file: File; preview: string; isNew: boolean }[]
  >([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [hideButton, setHideButton] = useState(false);

  const resetForm = () => {
    setData({ ...initialValue, user_id: user?.id });
    setEditId(0);
    setSelectedContact(null);
    setSelectedPurpose(null);
    setImages([]);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (data.contact_id == "") {
      toast.warn("Please select the contact", { containerId: "layout" });
      return;
    }
    if (data.purpose_id == "") {
      toast.warn("Please select the purpose", { containerId: "layout" });
      return;
    }

    if (images.length == 0) {
      toast.warn("Please load photos", { containerId: "layout" });
      return;
    }

    try {
      setLoading(true);
      let resp: AxiosResponse;

      if (editId > 0) {
        resp = await axios.post(
          `${url}visits/${editId}?_method=PUT`,
          {
            ...data,
            visit_images: images
              .filter((i) => i.isNew == true)
              .map((i) => i.file),
            existing_images: images
              .filter((i) => i.isNew == false)
              .map((i) => i.preview.replace(`${storageUrl}/`, "")),
          },
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Accept: "application/json",
              Authorization: `Bearer ${user?.token}`,
            },
          }
        );
      } else {
        resp = await axios.post(
          `${url}visits`,
          { ...data, visit_images: images.map((i) => i.file) },
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Accept: "application/json",
              Authorization: `Bearer ${user?.token}`,
            },
          }
        );
      }

      toast.success(resp.data.message, { containerId: "layout" });
      // resetForm();
      setHideButton(true);
      onSave();
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const getVisit = async (id: number) => {
    try {
      setLoading(true);
      const resp = await axios.get(`${url}visits/${id}`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
      });
      const { data } = resp;

      if (data.contact_id) {
        const selectedContact = contactOptions.find(
          (s) => s.value == data.contact_id
        );
        setSelectedContact(selectedContact ?? null);
      }

      if (data.purpose_id) {
        const selectedPurpose = purposeOptions.find(
          (s) => s.value == data.purpose_id
        );
        setSelectedPurpose(selectedPurpose ?? null);
      }

      if (data.visit_images) {
        const images = data.visit_images.map((i: { image_path: string }) => {
          return {
            file: null,
            preview: `${storageUrl}/${i.image_path}`,
            isNew: false,
          };
        });
        setImages(images);
      }

      setData({
        contact_id: data.contact_id,
        purpose_id: data.purpose_id,
        description: data.description,
        response: data.response,
        user_id: user?.id,
      });
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const getContactsAndPurposes = async () => {
    try {
      const resp1 = await axios.get(`${url}contacts`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
      });

      const resp2 = await axios.get(`${url}purposes`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
      });

      const contacts = resp1.data.contacts.map(
        (m: { id: number; name: string }) => ({ label: m.name, value: m.id })
      );
      setContactOptions(contacts);

      const purposes = resp2.data.purposes.map(
        (m: { id: number; name: string }) => ({ label: m.name, value: m.id })
      );
      setPurposeOptions(purposes);
    } catch (error) {
      handleError(error);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setData({ ...data, [name]: value });
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    const options = {
      maxSizeMB: 0.2, // Max 200 KB
      maxWidthOrHeight: 1024, // Resize to 1024px max
      useWebWorker: true,
      initialQuality: 0.7, // Lower image quality
      fileType: "image/webp", // Convert to WebP for best compression
    };
    
    const compressedFilePreviews = await Promise.all(
      files.map(async (file) => {
        try {
          const compressedFile = await imageCompression(file, options);
          return {
            file: compressedFile,
            preview: URL.createObjectURL(compressedFile),
            isNew: true,
          };
        } catch (error: any) {
          toast.warn(error.message, { containerId: "layout" });
          return null;
        }
      })
    );

    setImages((p) => [
      ...p,
      ...compressedFilePreviews.filter((f) => f != null),
    ]);

    // Reset input value to allow re-uploading the same file
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (index: number) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));

    // Reset input value if all files are removed
    if (images.length === 0 && fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  useEffect(() => {
    if (editId) getVisit(editId);
  }, [editId]);

  useEffect(() => {
    setData((p) => ({
      ...p,
      ...(selectedContact && { contact_id: selectedContact.value }),
      ...(selectedPurpose && { purpose_id: selectedPurpose.value }),
    }));
  }, [selectedContact, selectedPurpose]);

  useEffect(() => {
    getContactsAndPurposes();
  }, []);

  return (
    <ReactModal
      isOpen={show}
      className="modal"
      overlayClassName="modal-overlay"
      ariaHideApp={false}
      parentSelector={() => document.getElementById("work-space")!}
    >
      <div className="modal__header">
        <h2>{`${editId > 0 ? "Update Visit" : "Add Visit"} ${
          hideButton ? " (Saved)" : ""
        }`}</h2>
        <svg
          onClick={() => {
            setShow(false);
            setHideButton(false);
            resetForm();
          }}
        >
          <use xlinkHref="/icons/sprite.svg#icon-cross"></use>
        </svg>
      </div>
      <div className="modal__body">
        <form action="#" method="POST" className="form" onSubmit={handleSubmit}>
          <div className="modal__inputs">
            <div className="form__group">
              <Select
                id="contact_id"
                placeholder="Contact"
                options={contactOptions}
                value={selectedContact}
                handleChange={(e) => setSelectedContact(e)}
                isDisabled={hideButton}
              />
            </div>
            <div className="form__group">
              <Select
                id="purpose_id"
                placeholder="Purpose"
                options={purposeOptions}
                value={selectedPurpose}
                handleChange={(e) => setSelectedPurpose(e)}
                isDisabled={hideButton}
              />
            </div>
            <div className="form__group full">
              <input
                type="text"
                className="input"
                value={data.description}
                name="description"
                id="description"
                placeholder="Description"
                onChange={handleChange}
                disabled={hideButton}
              />
              <label htmlFor="description">Description</label>
            </div>
            <div className="form__group full">
              <input
                type="text"
                className="input"
                value={data.response}
                name="response"
                id="response"
                placeholder="Response"
                onChange={handleChange}
                disabled={hideButton}
              />
              <label htmlFor="response">Response</label>
            </div>
            <div className="form__group full">
              <input
                type="file"
                name="visit_images[]"
                id="visit_images"
                multiple
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                disabled={hideButton}
                ref={fileInputRef}
                style={{
                  display: "none",
                }}
              />
              <label
                htmlFor="visit_images"
                className="upload-btn"
                style={hideButton ? { display: "none" } : {}}
              >
                Load Photos <span> &rarr;</span>
              </label>
              <div className="image-previews">
                {images.map((image, index) => (
                  <div key={index} className="image-preview">
                    <img
                      src={image.preview}
                      alt={`Preview ${index + 1}`}
                      style={{
                        width: "10rem",
                        height: "10rem",
                        objectFit: "cover",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="remove-image"
                      style={hideButton ? { display: "none" } : {}}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="modal__actions">
            {loading ? (
              <div className="loading">
                <Loading color={colorSecondary} type="bars" />
              </div>
            ) : (
              !hideButton && (
                <button type="submit" className="btn">
                  {`${editId > 0 ? "Update" : "Save"}`}
                </button>
              )
            )}
          </div>
        </form>
      </div>
    </ReactModal>
  );
};

export default AddEditVisit;
