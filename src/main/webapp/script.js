// --- Elements Selection ---
const nameInput = document.getElementById('name');
const numberInput = document.getElementById('number');
const saveBtn = document.getElementById('saveCustomer');
const itemEntryBtn = document.getElementById('itemEntry');
const viewBtn = document.getElementById('view');

const enterDetailsDiv = document.getElementById('enter_details');
const viewRecordDiv = document.getElementById('viewRecord');
const itemsPage = document.getElementById('itemsPage');
const recordList = document.getElementById('recordList');

let customers = [];
let currentCustomerId = null; 

// --- 1. NAVIGATION & CUSTOMER FETCHING ---

const fetchAndRenderCustomers = () => {
    return fetch('/TailorShop/getCustomers') 
        .then(response => response.json())
        .then(data => {
            customers = data;
            renderRecords();
        })
        .catch(error => console.error("Fetch Error:", error));
};

viewBtn.addEventListener('click', () => {
    enterDetailsDiv.classList.add('hidden');
    viewRecordDiv.classList.remove('hidden');
    
    // 1. Updated Container Styling
    // We ensure 'relative' is set so the absolute 'X' stays inside this box
    viewRecordDiv.className = "relative p-10 pt-16 bg-white rounded-2xl shadow-2xl w-[95%] max-w-[600px] mx-auto mt-6 h-auto max-h-[85vh] flex flex-col";
    
    // 2. Ensure only the record list area scrolls, not the whole box
    // This prevents the 'X' button from scrolling away
    recordList.className = "flex flex-col gap-4 mt-6 w-full overflow-y-auto pr-2";
    
    document.getElementById('searchBar').value = '';
    
    // 3. Mandatory Close Button (Fixed Visibility)
    let closeViewBtn = document.getElementById('closeViewBox');
    if (!closeViewBtn) {
        closeViewBtn = document.createElement('button');
        closeViewBtn.id = "closeViewBox";
        // Using a bold 'X' string for better visibility if the icon fails
        closeViewBtn.innerHTML = '<i class="fas fa-times"></i>'; 
        // INCREASED z-index to 50 and set a fixed right/top position
        closeViewBtn.className = "absolute top-4 right-5 text-gray-400 hover:text-red-500 text-3xl cursor-pointer z-50 p-2 leading-none";
        closeViewBtn.onclick = () => {
            viewRecordDiv.classList.add('hidden');
            enterDetailsDiv.classList.remove('hidden');
        };
        viewRecordDiv.appendChild(closeViewBtn);
    }

    fetchAndRenderCustomers();
});
// --- SEARCH FUNCTIONALITY ---
document.getElementById('searchBar').addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase().trim();
    
    // Filter the global customers array by Name OR Phone
    const filteredCustomers = customers.filter(customer => {
        const nameMatch = customer.name.toLowerCase().includes(searchTerm);
        const phoneMatch = customer.phone.includes(searchTerm);
        return nameMatch || phoneMatch;
    });

    // Re-render the list with only the matches
    renderFilteredRecords(filteredCustomers);
});

// Helper to render only the searched items
function renderFilteredRecords(list) {
    recordList.innerHTML = '';
    if (list.length === 0) {
        recordList.innerHTML = '<p class="text-center text-gray-400 py-10">No matches found.</p>';
        return;
    }
    // Reuse your existing logic but for the filtered list
    list.forEach(customer => {
        const div = document.createElement('div');
        div.className = "p-4 bg-gray-50 border rounded-lg flex justify-between items-center w-full shadow-sm mb-3";
        div.innerHTML = `
            <div class="flex flex-col text-left">
                <span class="text-[10px] text-[#D45959] font-bold uppercase">${customer.date || 'Today'}</span>
                <span class="font-bold text-[#D45959] text-lg cursor-pointer hover:text-[#CB3434]" 
                      onclick="window.viewCustomerHistory(${customer.id}, '${customer.name}')">
                    ${customer.name}
                </span>
                <span class="text-[#D45959] font-medium">${customer.phone}</span>
            </div>
            <div class="flex gap-2">
                <button onclick="window.showItemsPage('${customer.name}', '${customer.phone}', ${customer.id})" class="bg-[#CB3434] text-white p-2 rounded hover:bg-[#DE7D7D] w-10 h-10">
                    <i class="fas fa-plus"></i>
                </button>
                <button onclick="deleteCustomer(${customer.id})" class="text-red-500 p-2 hover:text-red-700 w-10 h-10">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        `;
        recordList.appendChild(div);
    });
}
// --- HANDLE ENTER KEY ---
document.getElementById('searchBar').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault(); // Prevents the page from reloading
        const searchTerm = e.target.value.toLowerCase().trim();
        
        // Final filter check
        const filtered = customers.filter(c => 
            c.name.toLowerCase().includes(searchTerm) || 
            c.phone.includes(searchTerm)
        );
        
        renderFilteredRecords(filtered);
        console.log("Search triggered by Enter key for:", searchTerm);
    }
});
// --- 2. CUSTOMER ACTIONS ---

saveBtn.onclick = () => {
    const name = nameInput.value.trim();
    const phone = numberInput.value.trim();

    if (!name || !phone) {
        alert("Please enter details first!");
        return;
    }

    const params = new URLSearchParams();
    params.append('name', name);
    params.append('phone', phone);

    fetch('saveCustomer', { method: 'POST', body: params })
        .then(res => res.text())
        .then(data => {
            if(data === "Success") {
                fetchAndRenderCustomers().then(() => {
                    showStatus("Customer saved successfully!", true);
                });
            } else {
                showStatus("Error saving customer.", false);
            }
        });
}; // Added the missing closing bracket here

function showStatus(message, isSuccess) {
    const statusMsg = document.getElementById('statusMsg');
    statusMsg.innerText = message;
    statusMsg.style.color = isSuccess ? "#CB3434" : "#140505"; 
    statusMsg.classList.remove('opacity-0');

    setTimeout(() => {
        statusMsg.classList.add('opacity-0');
    }, 3000);
}

itemEntryBtn.onclick = () => {
    const name = nameInput.value.trim();
    const phone = numberInput.value.trim();

    if (name && phone) {
        // Look for the customer in the recently fetched list to get their ID
        const found = customers.find(c => c.name === name && c.phone === phone);
        if (found) {
            window.showItemsPage(found.name, found.phone, found.id);
        } else {
            // If not found in memory, try to show page without ID (fallback)
            window.showItemsPage(name, phone);
        }
    } else {
        alert("Please enter customer details first!");
    }
};

// --- 3. VIEW BOX RENDERING ---

function renderRecords() {
    recordList.innerHTML = '';
    if (customers.length === 0) {
        recordList.innerHTML = '<p class="text-center text-gray-400 py-10">No records found.</p>';
        return;
    }

    customers.forEach(customer => {
        const div = document.createElement('div');
        div.className = "p-4 bg-gray-50 border rounded-lg flex justify-between items-center w-full shadow-sm mb-3";
        div.innerHTML = `
            <div class="flex flex-col text-left">
                <span class="text-[10px] text-[#D45959] font-bold uppercase">${customer.date || 'Today'}</span>
                <span class="font-bold text-[#D45959] text-lg cursor-pointer hover:text-[#CB3434]" 
                      onclick="window.viewCustomerHistory(${customer.id}, '${customer.name}')">
                    ${customer.name}
                </span>
                <span class="text-[#D45959] font-medium">${customer.phone}</span>
            </div>
            <div class="flex gap-2">
                <button onclick="window.showItemsPage('${customer.name}', '${customer.phone}', ${customer.id})" class="bg-[#CB3434] text-white p-2 rounded hover:bg-[#DE7D7D] w-10 h-10">
                    <i class="fas fa-plus"></i>
                </button>
                <button onclick="deleteCustomer(${customer.id})" class="text-red-500 p-2 hover:text-red-700 w-10 h-10">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        `;
        recordList.appendChild(div);
    });
}

window.deleteCustomer = (id) => {
    if(!confirm("Delete this customer?")) return;
    const params = new URLSearchParams();
    params.append('id', id);
    fetch('/TailorShop/deleteCustomer', { method: 'POST', body: params })
    .then(res => res.text())
    .then(data => {
        if (data === "Success") {
            customers = customers.filter(c => c.id !== id);
            renderRecords();
        }
    });
};

// --- 4. ITEMS PAGE LOGIC ---

window.showItemsPage = (name, phone, id = null) => {
    currentCustomerId = id; 
    enterDetailsDiv.classList.add('hidden');
    viewRecordDiv.classList.add('hidden');
    itemsPage.classList.remove('hidden');
    document.getElementById('displayItemName').innerText = name;
    document.getElementById('displayItemPhone').innerText = phone;
    loadDefaultItems();
};

document.getElementById('backToView').onclick = () => {
    itemsPage.classList.add('hidden');
    viewRecordDiv.classList.remove('hidden');
    fetchAndRenderCustomers(); 
};

function loadDefaultItems() {
    const defaults = ["Normal Blouse(No lining)", "Normal Blouse(with lining)", "Normal chudi", "Design chudi", "Frock"];
    const tbody = document.getElementById('itemList');
    tbody.innerHTML = '';
    defaults.forEach(item => createItemRow(item));
}

function createItemRow(itemName) {
    const tr = document.createElement('tr');
    tr.className = "border-b hover:bg-gray-50";
    tr.innerHTML = `
        <td class="p-2"><input type="text" value="${itemName}" class="border p-2 w-full rounded"></td>
        <td class="p-2 flex items-center gap-2 justify-center">
            <button class="bg-gray-200 px-3 py-1 rounded" onclick="changeQty(this, -1)">-</button>
            <input type="number" value="0" class="qty w-12 text-center border-none bg-transparent font-bold">
            <button class="bg-gray-200 px-3 py-1 rounded" onclick="changeQty(this, 1)">+</button>
        </td>
        <td class="p-2"><input type="number" placeholder="₹" class="amt border p-2 w-full rounded" oninput="updateTotal()"></td>
        <td class="p-2 text-center"><button class="text-red-400" onclick="this.parentElement.parentElement.remove(); updateTotal()">✖</button></td>
    `;
    document.getElementById('itemList').appendChild(tr);
}

window.changeQty = (btn, val) => {
    const input = btn.parentElement.querySelector('.qty');
    input.value = Math.max(0, (parseInt(input.value) || 0) + val);
    updateTotal();
};

window.updateTotal = () => {
    let total = 0;
    document.querySelectorAll('#itemList tr').forEach(row => {
        const q = parseInt(row.querySelector('.qty').value) || 0;
        const a = parseFloat(row.querySelector('.amt').value) || 0;
        total += q * a;
    });
    document.getElementById('totalAmount').innerText = total.toLocaleString('en-IN');
};

document.getElementById('addNewRowBtn').onclick = () => createItemRow("");

// --- 5. BILL GENERATION & SAVING ---

document.getElementById('generateBill').onclick = () => {
    const name = document.getElementById('displayItemName').innerText;
    const phone = document.getElementById('displayItemPhone').innerText;
    const total = document.getElementById('totalAmount').innerText;
    const items = [];

    document.querySelectorAll('#itemList tr').forEach(row => {
        const itemName = row.querySelector('td:first-child input').value;
        const qty = parseInt(row.querySelector('.qty').value) || 0;
        const price = parseFloat(row.querySelector('.amt').value) || 0;
        if (qty > 0) items.push({ name: itemName, qty: qty, price: price });
    });

    if (items.length === 0) {
        alert("Please add items.");
        return;
    }

    if (currentCustomerId) {
        const params = new URLSearchParams();
        params.append('customerId', currentCustomerId); 
        params.append('total', total.replace(/,/g, ''));
        params.append('items', JSON.stringify(items)); 

        fetch('/TailorShop/saveBill', { method: 'POST', body: params })
        .then(res => res.text())
        .then(data => {
            if (data === "Success") {
                console.log("✅ Saved");
                nameInput.value = '';
                numberInput.value = '';
            }
        });
    }

    // Modal Population
    document.getElementById('billCustName').innerText = name;
    document.getElementById('billCustPhone').innerText = phone;
    document.getElementById('billDate').innerText = new Date().toLocaleDateString('en-GB');
    document.getElementById('billTotal').innerText = total;

    const billBody = document.getElementById('billItemsBody');
    billBody.innerHTML = '';
    items.forEach(item => {
        billBody.innerHTML += `
            <tr class="border-b">
                <td class="py-2">${item.name}</td>
                <td class="py-2 text-center">${item.qty}</td>
                <td class="py-2 text-right">₹${item.price}</td>
            </tr>`;
    });
    document.getElementById('billModal').classList.remove('hidden');
};

// --- 6. HISTORY VIEW ---

function formatItems(itemsData) {
    try {
        const items = typeof itemsData === 'string' ? JSON.parse(itemsData) : itemsData;
        return items.map(item => 
            `<div class="flex justify-between w-full py-1 border-b border-gray-50 last:border-0">
                <span class="text-gray-700">${item.name}</span> 
                <span class="text-purple-600 font-bold">x${item.qty}</span>
            </div>`).join("");
    } catch (e) { return "No details"; }
}

window.viewCustomerHistory = (id, name) => {
    fetch(`/TailorShop/getHistory?customerId=${id}`)
        .then(res => res.json())
        .then(bills => {
            const totalSpent = bills.reduce((sum, b) => sum + parseFloat(b.total_amount || 0), 0);
            recordList.innerHTML = `
                <div class="mb-6 border-b pb-3">
                    <div class="flex justify-between items-center">
                        <h2 class="text-xl font-bold text-purple-900">${name}</h2>
                        <button onclick="fetchAndRenderCustomers()" class="text-purple-600 hover:underline">Back to List</button>
                    </div>
                    <p class="text-sm font-bold text-purple-500">Total Spend: ₹${totalSpent.toLocaleString('en-IN')}</p>
                </div>`;
            
            bills.forEach(bill => {
                const div = document.createElement('div');
                div.className = "p-5 bg-white border border-purple-100 rounded-2xl mb-4 shadow-sm";
                div.innerHTML = `
                    <div class="flex justify-between items-start">
                        <div class="flex-1">
                            <span class="text-[11px] font-bold text-purple-400">${bill.bill_date}</span>
                            <div class="mt-2 text-sm">${formatItems(bill.items_json)}</div>
                        </div>
                        <div class="text-right flex flex-col items-end gap-2">
                            <span class="font-black text-purple-900 text-xl">₹${bill.total_amount}</span>
                            <button onclick="deleteSingleBill(${bill.id}, ${id}, '${name}')" class="text-red-400 hover:text-red-600">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </div>
                    </div>`;
                recordList.appendChild(div);
            });
        });
};

window.deleteSingleBill = (billId, customerId, name) => {
    const params = new URLSearchParams();
    params.append('billId', billId);
    fetch('/TailorShop/deleteBill', { method: 'POST', body: params })
    .then(res => res.text())
    .then(data => {
        if (data === "Success") window.viewCustomerHistory(customerId, name);
    });
};

// Modal functions
window.closeBill = () => document.getElementById('billModal').classList.add('hidden');

// Pre-load customers on start
fetchAndRenderCustomers();
// --- 7. EXPORT & SHARING LOGIC ---

// Download as Image (PNG)
window.downloadAsImage = () => {
    const bill = document.getElementById('billPrintArea');
    // scale: 3 ensures the text is sharp and not blurry
    html2canvas(bill, { scale: 3, useCORS: true }).then(canvas => {
        const link = document.createElement('a');
        const name = document.getElementById('billCustName').innerText || 'Customer';
        link.download = `Bill_${name}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
    });
};

// Download as PDF
window.downloadAsPDF = () => {
    const { jsPDF } = window.jspdf;
    const bill = document.getElementById('billPrintArea');

    html2canvas(bill, { scale: 3, useCORS: true }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        const name = document.getElementById('billCustName').innerText || 'Customer';
        pdf.save(`Bill_${name}.pdf`);
    });
};

// WhatsApp Sharing
window.shareWhatsApp = () => {
    const name = document.getElementById('billCustName').innerText;
    const phone = document.getElementById('billCustPhone').innerText;
    const total = document.getElementById('billTotal').innerText;
    
    // Customize your shop name here
    let message = `*TAILOR SHOP BILL*%0A`;
    message += `Customer: ${name}%0A`;
    message += `--------------------------%0A`;
    
    // Loop through the items currently in the bill modal
    document.querySelectorAll('#billItemsBody tr').forEach(row => {
        const cols = row.querySelectorAll('td');
        if (cols.length >= 3) {
            message += `${cols[0].innerText} x ${cols[1].innerText} = ${cols[2].innerText}%0A`;
        }
    });

    message += `--------------------------%0A`;
    message += `*Total: ₹${total}*%0A`;
    message += `Thank you for your business!`;

    // Opens WhatsApp Web or App
    const whatsappUrl = `https://wa.me/91${phone}?text=${message}`;
    window.open(whatsappUrl, '_blank');
};