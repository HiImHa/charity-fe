// Import Hook
import React from "react";
import { useOutletContext } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { Outlet } from "react-router-dom";
import { useParams, Link } from "react-router-dom";

export default function CharityCampaignsEdit() {
    const { id } = useParams();
    console.log("---> CharityCampaignsEdit rendering ")
    const context = useOutletContext();
    console.log('Thông tin context: ', context);
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [url, setURL] = useState('');
    const [goalAmount, setGoalAmount] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [state, setState] = useState('');
    const [locations, setLocations] = useState(
        [{
            name: '',
            latitude: '',
            longitude: '',
            damageLevel: '',
            needsHelp: true,
            ward: '',
            district: '',
            province: '',
            city: '',
            goalAmount: '',
        }]
    );
    const [msg, setMsg] = useState('');
    const [err, setErr] = useState('');
    const campaignInformation = { title, description, url, goalAmount, startDate, endDate, locations };
    console.log('campaignInformation', campaignInformation);

    function HandleSubmit(event) {
        event.preventDefault();
        // Data of User
        console.log('Thông tin đăng ký - campaignInformation: ', campaignInformation);
        // Example usage
        if (validInput(campaignInformation)) {
            setMsg("");
            console.log("All fields are filled!");
            console.log('campaignInformation', campaignInformation);
            console.log('locations', locations);

            registerApi(campaignInformation);
        } else {
            console.log("Some fields are invalid!");
        }
    };

    function HandleAddLoaction(event) {
        event.preventDefault();
        const emptyLocation = {
            name: '',
            latitude: '',
            longitude: '',
            damageLevel: '',
            needsHelp: true,
            ward: '',
            district: '',
            province: '',
            city: '',
            goalAmount: '',
        }
        const updatedLocations = [...locations, emptyLocation];
        setLocations(updatedLocations);
    };

    function HandleRemoveLocation(event, index) {
        event.preventDefault();
        const updatedLocations = [...locations]; // Clone the array to avoid mutating state directly
        if (index === 0) return;
        updatedLocations.splice(index, 1); // Remove 1 item at the given index
        setLocations(updatedLocations);
    };

    function HandleAmount(index, value) {
        // Create a copy of the current locations array
        const updatedLocations = [...locations];

        // Update the specific location with the new value
        updatedLocations[index] = {
            ...updatedLocations[index],
            goalAmount: value,
        };

        // Calculate the sum using the updated array
        let sum = 0;
        for (let i = 0; i < updatedLocations.length; i++) {
            let money = parseInt(updatedLocations[i].goalAmount, 10); // Parse as integer
            console.log("money", money);
            if (isNaN(money)) {
                money = 0; // Default to 0 if parsing fails
            }
            sum += money;
        }

        // Update both the locations and the total goal amount in state
        setLocations(updatedLocations); // Update the state with the modified locations
        setGoalAmount(sum); // Update the total goal amount
    }


    function validInput(campaignInformation) {
        const { title, description, url, goalAmount, startDate, endDate, locations } = campaignInformation;
        if (
            !title ||
            !description ||
            !goalAmount ||
            !startDate ||
            !endDate ||
            !locations ||
            !url
        ) {
            setMsg('fieldEmpty');
            return false;
        }
        if (!startDate || !endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            // Check if end date is after start date
            if (end <= start) {
                setMsg("End date must be after the start date.");
                return false;
            }

            return true
        };
        return true; // All fields are valid (not empty)
    }

    useEffect(() => {
        // Function to fetch data
        console.log('id', id);
        const fetchData = async () => {
            try {
                const response = await fetch(`http://localhost:5000/campaigns/${id}`, {
                    method: "GET",
                    headers: {
                        'Content-Type': "application/json",
                        'Authorization': `Bearer ${context.isLog.isLog}` // Ensure this value is valid
                    },
                });

                const data = await response.json();

                if (response.ok) {
                    console.log('Campaign GETTED:', data);
                    setTitle(data.title);
                    setDescription(data.description);
                    setGoalAmount(parseInt(data.goalAmount));
                    setStartDate(data.startDate);
                    setEndDate(data.endDate);
                    setState(data.status);
                    setURL(data.url);
                    // Validate and set locations
                    if (Array.isArray(data.Locations)) {
                        setLocations(data.Locations);
                    } else {
                        console.error("Invalid locations format:", data.Locations);
                        setLocations([]); // Fallback
                    }
                } else {
                    console.error('Campaign GETTED Fail:', data.message);
                    setMsg('CampaignGetFail');
                }
            } catch (err) {
                console.error('Campaign Get Fail - Error:', err.message);
                setMsg('CampaignGetFail');
            }
        };

        fetchData(); // Call the function when the component mounts
    }, []); // Empty dependency array ensures it runs only once

    async function deleteCampaign() {
        if (window.confirm(`Bạn muốn xóa chiến dịch này phải không?`)) {
            try {
                const response = await fetch(`http://localhost:5000/campaigns/delete/${id}`, {
                    method: "DELETE",
                    headers: {
                        'Content-Type': "application/json",
                        'Authorization': `Bearer ${context.isLog.isLog}` // Ensure this value is valid
                    },
                    body: JSON.stringify(campaignInformation),
                });

                const data = await response.json();

                if (response.ok) {
                    console.log('Campaign Deleted:', data);
                    navigate("/auth/charityCampaign");
                } else {
                    console.error('Campaign Delete Fail:', data.message);
                    setMsg('CampaignDeleteFail');
                    setErr(data.message);
                }
            } catch (error) {
                console.error('Campaign Delete Fail - Error:', error.message);
                setMsg('CampaignDeleteFail');
                setErr(error.message);
            }
        } else { return; }
    }

    async function registerApi(campaignInformation) {
        if (window.confirm(`Bạn muốn cập nhật chiến dịch này phải không?`)) {
            if (context.auth.user.role === "admin") {
                try {
                    const response = await fetch(`http://localhost:5000/campaigns/update-status/${id}`, {
                        method: "PATCH",
                        headers: {
                            'Content-Type': "application/json",
                            'Authorization': `Bearer ${context.isLog.isLog}` // Ensure this value is valid
                        },
                        body: JSON.stringify({ status: state }),
                    });

                    const data = await response.json();

                    if (response.ok) {
                        console.log('Campaign Update:', data);
                    } else {
                        console.error('Campaign Update Fail:', data.message);
                        setMsg('CampaignUpdateFail');
                        setErr(data.message);
                    }
                } catch (error) {
                    console.error('Campaign Update Fail - Error:', error.message);
                    setMsg('CampaignUpdateFail');
                    setErr(error.message);
                }
            }
            try {
                const response = await fetch(`http://localhost:5000/campaigns/update/${id}`, {
                    method: "PUT",
                    headers: {
                        'Content-Type': "application/json",
                        'Authorization': `Bearer ${context.isLog.isLog}` // Ensure this value is valid
                    },
                    body: JSON.stringify(campaignInformation),
                });

                const data = await response.json();

                if (response.ok) {
                    console.log('Campaign Update:', data);
                    navigate("/auth/charityCampaign");
                } else {
                    console.error('Campaign Update Fail:', data.message);
                    setMsg('CampaignUpdateFail');
                    setErr(data.message);
                }
            } catch (error) {
                console.error('Campaign Update Fail - Error:', error.message);
                setMsg('CampaignUpdateFail');
                setErr(error.message);
            }
        } else { return; }
    }
    return (
        <div>
            <div className=" bg-gray-900">
                <div className="flex justify-center">
                    <div className="bg-gray-900 flex items-start w-full max-w-md px-6 mx-auto lg:w-2/6">
                        <div className="flex-1 mt-2">
                            <div className="text-center">
                                <h2 className="text-4xl font-bold text-center  text-white">Cập nhật chiến dịch <span onClick={deleteCampaign} className="ms-5 ml-5 cursor-pointer inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white rounded-lg bg-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-blue-300">
                                    Xóa chiến dịch</span></h2>

                            </div>
                            {/* <div className="text-center">
                                <Link to={`/auth/ExpenseCompaignCreate/${id}`} className="mt-5 ml-5 cursor-pointer inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white rounded-lg bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300">
                                    Cập nhật chi tiêu chiến dịch</Link>
                            </div> */}
                            {msg === "fieldEmpty"
                                ? <div className="bg-red-100 border border-red-400 text-red-700 px-4 pb-3 rounded relative" role="alert">
                                    <strong className="font-bold">Không thành công! </strong>
                                    <span className="block sm:inline">Một số thông tin chưa điền!</span>
                                </div>
                                : ""
                            }
                            {msg === "End date must be after the start date."
                                ? <div className="bg-red-100 border border-red-400 text-red-700 px-4 pb-3 rounded relative" role="alert">
                                    <strong className="font-bold">Không thành công! </strong>
                                    <span className="block sm:inline">Ngày bắt đầu phải trước ngày kết thúc!</span>
                                </div>
                                : ""
                            }
                            {msg === "CampaignCreateFail"
                                ? <div className="bg-red-100 border border-red-400 text-red-700 px-4 pb-3 rounded relative" role="alert">
                                    <strong className="font-bold">Không thành công! </strong>
                                    <span className="block sm:inline"> Tạo campaigns không thành công: {err}</span>
                                </div>
                                : ""
                            }
                            <div className="mt-2">
                                <form>
                                    <div>
                                        <label htmlFor="firstName" className="pt-2 block mb-1 text-sm  text-gray-200">Tên chiến dịch:</label>
                                        <input required value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            type="text" name="title" id="title" placeholder="Bão Yagi" className="block w-full px-4 pb-2 mt-1  border  rounded-md placeholder-gray-600 bg-gray-900 text-gray-300 border-gray-700  focus:border-blue-400 focus:ring-blue-400 focus:outline-none focus:ring focus:ring-opacity-40" />
                                    </div>
                                    <div>
                                        <label htmlFor="description" className="pt-2  block mb-1 text-sm  text-gray-200">Thông tin chi tiết:</label>
                                        <textarea rows='10' required value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            type="text" name="description" id="description" placeholder="Chi tiết" className="block w-full px-4 pb-2 mt-1  border  rounded-md placeholder-gray-600 bg-gray-900 text-gray-300 border-gray-700  focus:border-blue-400 focus:ring-blue-400 focus:outline-none focus:ring focus:ring-opacity-40" />
                                    </div>
                                    <div>
                                        <label htmlFor="url" className="pt-2  block mb-1 text-sm  text-gray-200">URL Hình Ảnh:</label>
                                        <textarea required value={url}
                                            onChange={(e) => setURL(e.target.value)}
                                            type="text" name="url" id="url" placeholder="URL hình ảnh" className="block w-full px-4 pb-2 mt-1  border rounded-md placeholder-gray-600 bg-gray-900 text-gray-300 border-gray-700  focus:border-blue-400 focus:ring-blue-400 focus:outline-none focus:ring focus:ring-opacity-40" />
                                    </div>
                                    <div>
                                        <label htmlFor="goalAmount" className="pt-2 block mb-1 text-sm  text-gray-200">Số tiền kêu gọi:</label>
                                        <p className="block w-full px-4 pb-2 mt-1  border  rounded-md placeholder-gray-600 bg-gray-900 text-gray-300 border-gray-700  focus:border-blue-400 focus:ring-blue-400 focus:outline-none focus:ring focus:ring-opacity-40 [color-scheme:dark]">Tự động điền từ cố tiền kêu gọi của các khu vực <span className="font-bold">{goalAmount}</span> </p>
                                    </div>
                                    <div>
                                        <label htmlFor="startDate" className="pt-2 block mb-1 text-sm text-gray-200">Ngày bắt đầu:</label>
                                        <input required value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            type="date" name="startDate" id="startDate" className="block w-full px-4 pb-2 mt-1 border  rounded-md placeholder-gray-600 bg-gray-900 text-gray-300 border-gray-700  focus:border-blue-400 focus:ring-blue-400 focus:outline-none focus:ring focus:ring-opacity-40" />
                                    </div>
                                    <div>
                                        <label htmlFor="endDate" className="pt-2 block mb-1 text-sm text-gray-200">Ngày kết thúc:</label>
                                        <input required value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            type="date" name="endDate" id="endDate" className="block w-full px-4 pb-2 mt-1  border  rounded-md placeholder-gray-600 bg-gray-900 text-gray-300 border-gray-700  focus:border-blue-400 focus:ring-blue-400 focus:outline-none focus:ring focus:ring-opacity-40" />
                                    </div>
                                    {context.auth.user.role === "admin"
                                        ? <div>
                                            <label htmlFor="state" className="pt-2 block mb-1 text-sm  text-gray-200">
                                                Trạng thái:
                                            </label>
                                            <select required value={state}
                                                onChange={(e) => setState(e.target.value)} id="state" className="block w-full px-4 pb-2 mt-1  border  rounded-md placeholder-gray-600 bg-gray-900 text-gray-300 border-gray-700  focus:border-blue-400 focus:ring-blue-400 focus:outline-none focus:ring focus:ring-opacity-40">
                                                <option value="">--Chọn--</option>
                                                <option value="pending">Chờ </option>
                                                <option value="active">Đang hoạt động</option>
                                                <option value="completed">Hoàn thành</option>
                                                <option value="cancelled">Hủy</option>
                                            </select>
                                        </div>
                                        : ""
                                    }


                                    {locations.map((location, index) => (
                                        <div key={index}>
                                            <h2 className="pt-2 text-l font-bold text-center text-white"> Khu vực số {index + 1}:</h2>
                                            <div className="mt-2">
                                                {index != 0 &&
                                                    <button onClick={event => HandleRemoveLocation(event, index)}
                                                        className="w-full px-4 py-2 tracking-wide text-white transition-colors duration-200 transform bg-red-500 rounded-md hover:bg-red-400 focus:outline-none focus:bg-blue-400 focus:ring focus:ring-blue-300 focus:ring-opacity-50">
                                                        Xóa khu vực này
                                                    </button>
                                                }
                                            </div>
                                            <div>
                                                <label htmlFor="name" className="pt-2 block mb-1 text-sm  text-gray-200">Tên khu vực:</label>
                                                <input required value={location.name || ""}
                                                    onChange={(e) => {
                                                        const updatedLocations = [...locations];
                                                        updatedLocations[index] = { ...updatedLocations[index], name: e.target.value };
                                                        setLocations(updatedLocations);
                                                    }}
                                                    type="text" name="name" id="name" placeholder="Hưng Yên" className="block w-full px-4 pb-2 mt-1  border  rounded-md placeholder-gray-600 bg-gray-900 text-gray-300 border-gray-700 focus:border-blue-400  focus:ring-blue-400 focus:outline-none focus:ring focus:ring-opacity-40" />
                                            </div>
                                            <div>
                                                <label htmlFor="latitude" className="pt-2  block mb-1 text-sm  text-gray-200">Kinh độ của khu vực:
                                                    <a className="text-blue-500" href="https://www.latlong.net/"> ( Lấy thông tin kinh độ và vĩ độ tại đây )</a></label>
                                                <input required
                                                    value={location.latitude || ""}
                                                    onChange={(e) => {
                                                        const updatedLocations = [...locations];
                                                        updatedLocations[index] = { ...updatedLocations[index], latitude: e.target.value };
                                                        setLocations(updatedLocations);
                                                    }}

                                                    type="text" name="latitude" id="latitude" placeholder="19.25" className="block w-full px-4 pb-2 mt-1  border  rounded-md placeholder-gray-600 bg-gray-900 text-gray-300 border-gray-700 focus:border-blue-400  focus:ring-blue-400 focus:outline-none focus:ring focus:ring-opacity-40" />
                                            </div>
                                            <div>
                                                <label htmlFor="longitude" className="pt-2  block mb-1 text-sm  text-gray-200">Vĩ độ của khu vực:<a className="text-blue-500" href="https://www.latlong.net/"> ( Lấy thông tin kinh độ và vĩ độ tại đây )</a></label>
                                                <input required value={location.longitude || ""}
                                                    onChange={(e) => {
                                                        const updatedLocations = [...locations];
                                                        updatedLocations[index] = { ...updatedLocations[index], longitude: e.target.value };
                                                        setLocations(updatedLocations);
                                                    }}
                                                    type="text" name="longitude" id="longitude" placeholder="25.19" className="block w-full px-4 pb-2 mt-1 border  rounded-md placeholder-gray-600 bg-gray-900 text-gray-300 border-gray-700 focus:border-blue-400  focus:ring-blue-400 focus:outline-none focus:ring focus:ring-opacity-40" />
                                            </div>
                                            <div>
                                                <label htmlFor="damageLevel" className="pt-2 block mb-1 text-sm  text-gray-200">
                                                    Độ thiệt hại:
                                                </label>
                                                <select
                                                    value={location.damageLevel || ""}
                                                    onChange={(e) => {
                                                        const updatedLocations = [...locations]; // Clone the array
                                                        updatedLocations[index] = { ...updatedLocations[index], damageLevel: e.target.value }; // Update the first element
                                                        setLocations(updatedLocations); // Update the state
                                                    }}
                                                    id="damageLevel"
                                                    className="block w-full px-4 pb-2 mt-1 border  rounded-md placeholder-gray-600 bg-gray-900 text-gray-300 border-gray-700 focus:border-blue-400  focus:ring-blue-400 focus:outline-none focus:ring focus:ring-opacity-40"
                                                    aria-label="Chọn mức độ thiệt hại"
                                                >
                                                    <option value="" disabled>
                                                        --Chọn--
                                                    </option>
                                                    <option value="1">1</option>
                                                    <option value="2">2</option>
                                                    <option value="3">3</option>
                                                    <option value="4">4</option>
                                                    <option value="5">5</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label htmlFor="ward" className="pt-2  block mb-1 text-sm  text-gray-200">Phường:</label>
                                                <input required value={location.ward || ""}
                                                    onChange={(e) => {
                                                        const updatedLocations = [...locations];
                                                        updatedLocations[index] = { ...updatedLocations[index], ward: e.target.value };
                                                        setLocations(updatedLocations);
                                                    }}
                                                    type="text" name="ward" id="ward" placeholder="Phường 1" className="block w-full px-4 pb-2 mt-1  border rounded-md placeholder-gray-600 bg-gray-900 text-gray-300 border-gray-700 focus:border-blue-400  focus:ring-blue-400 focus:outline-none focus:ring focus:ring-opacity-40" />
                                            </div>
                                            <div>
                                                <label htmlFor="district" className="pt-2  block mb-1 text-sm  text-gray-200">Quận:</label>
                                                <input required value={location.district || ""}
                                                    onChange={(e) => {
                                                        const updatedLocations = [...locations];
                                                        updatedLocations[index] = { ...updatedLocations[index], district: e.target.value };
                                                        setLocations(updatedLocations);
                                                    }}
                                                    type="text" name="district" id="district" placeholder="Quận 10" className="block w-full px-4 pb-2 mt-1  border rounded-md placeholder-gray-600 bg-gray-900 text-gray-300 border-gray-700  focus:border-blue-400 focus:ring-blue-400 focus:outline-none focus:ring focus:ring-opacity-40" />
                                            </div>
                                            <div>
                                                <label htmlFor="province" className="pt-2  block mb-1 text-sm  text-gray-200">Tỉnh:</label>
                                                <input required value={location.province || ""}
                                                    onChange={(e) => {
                                                        const updatedLocations = [...locations];
                                                        updatedLocations[index] = { ...updatedLocations[index], province: e.target.value };
                                                        setLocations(updatedLocations);
                                                    }}
                                                    type="text" name="province" id="province" placeholder="Hưng Yên" className="block w-full px-4 pb-2 mt-1 border rounded-md placeholder-gray-600 bg-gray-900 text-gray-300 border-gray-700  focus:border-blue-400 focus:ring-blue-400 focus:outline-none focus:ring focus:ring-opacity-40" />
                                            </div>
                                            <div>
                                                <label htmlFor="city" className="pt-2  block mb-1 text-sm  text-gray-200">Thành phố:</label>
                                                <input required value={location.city || ""}
                                                    onChange={(e) => {
                                                        const updatedLocations = [...locations];
                                                        updatedLocations[index] = { ...updatedLocations[index], city: e.target.value };
                                                        setLocations(updatedLocations);
                                                    }}
                                                    type="text" name="city" id="city" placeholder="Hưng Yên" className="block w-full px-4 pb-2 mt-1  border  rounded-md placeholder-gray-600 bg-gray-900 text-gray-300 border-gray-700  focus:border-blue-400 focus:ring-blue-400 focus:outline-none focus:ring focus:ring-opacity-40" />
                                            </div>
                                            <div>
                                                <label htmlFor="goalAmount" className="pt-2  block mb-1 text-sm  text-gray-200">Số tiền cần kêu gọi của khu vực:</label>
                                                <input required value={parseInt(locations[index].goalAmount) || ""}
                                                    onChange={(e) => HandleAmount(index, e.target.value)}
                                                    type="text" name="goalAmount" id="goalAmount" placeholder="25000000" className="block w-full px-4 pb-2 mt-1  border  rounded-md placeholder-gray-600 bg-gray-900 text-gray-300 border-gray-700  focus:border-blue-400 focus:ring-blue-400 focus:outline-none focus:ring focus:ring-opacity-40" />
                                            </div>
                                        </div>
                                    ))}


                                    <div className="mt-2">
                                        <button onClick={HandleAddLoaction}
                                            className="w-full px-4 py-2 tracking-wide text-white transition-colors duration-200 transform bg-blue-500 rounded-md hover:bg-blue-400 focus:outline-none focus:bg-blue-400 focus:ring focus:ring-blue-300 focus:ring-opacity-50">
                                            Thêm khu vực
                                        </button>
                                    </div>

                                    <div className="mt-2">
                                        <button onClick={HandleSubmit}
                                            className="w-full px-4 py-2 tracking-wide text-white transition-colors duration-200 transform bg-blue-500 rounded-md hover:bg-blue-400 focus:outline-none focus:bg-blue-400 focus:ring focus:ring-blue-300 focus:ring-opacity-50">
                                            Cập nhật chiến dịch
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div >
            <Outlet context={context} />
        </div >
    );
}

