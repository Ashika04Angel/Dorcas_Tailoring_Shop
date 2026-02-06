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
    return fetch('getCustomers') 
        .then(response => {
			if (!response.ok) {
			      throw new Error('Failed to fetch customers');
			    }
			    return response.json();
		})
        .then(data => {
           customers = Array.isArray(data) ? data : [];
            renderRecords();
        })
        .catch(error => {
			console.error("Fetch Error:", error);
			recordList.innerHTML =
			   '<p class="text-center text-red-500 py-10">Failed to load customers</p>';
		});
};

viewBtn.addEventListener('click', () => {
    enterDetailsDiv.classList.add('hidden');
    viewRecordDiv.classList.remove('hidden');
    
    // UI Styling logic
    viewRecordDiv.className = "relative p-10 pt-16 bg-white rounded-2xl shadow-2xl w-[95%] max-w-[600px] mx-auto mt-6 h-auto max-h-[85vh] flex flex-col";
    recordList.className = "flex flex-col gap-4 mt-6 w-full overflow-y-auto pr-2";
    document.getElementById('searchBar').value = '';
    
    // Close button logic
    let closeViewBtn = document.getElementById('closeViewBox');
    if (!closeViewBtn) {
        closeViewBtn = document.createElement('button');
        closeViewBtn.id = "closeViewBox";
        closeViewBtn.innerHTML = '<i class="fas fa-times"></i>'; 
        closeViewBtn.className = "absolute top-4 right-5 text-gray-400 hover:text-red-500 text-3xl cursor-pointer z-50 p-2 leading-none";
        closeViewBtn.onclick = () => {
            viewRecordDiv.classList.add('hidden');
            enterDetailsDiv.classList.remove('hidden');
        };
        viewRecordDiv.appendChild(closeViewBtn);
    }
    fetchAndRenderCustomers();
});

// --- SEARCH & RENDERING ---

function renderRecords() {
    renderFilteredRecords(customers);
}

function renderFilteredRecords(list) {
    recordList.innerHTML = '';
    if (list.length === 0) {
        recordList.innerHTML = '<p class="text-center text-gray-400 py-10">No records found.</p>';
        return;
    }

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

		fetch('saveCustomer', { 
		        method: 'POST', 
		        body: params 
		    })
	
        .then(res => {
			if (!res.ok) throw new Error('Server error');
			 	 return res.text();
		})
        .then(data => {
			if (data.trim().toLowerCase() === "success") {
			        fetchAndRenderCustomers().then(() => {
			            showStatus("Customer saved! Now you can click 'Add Details'.", true);
			        });
			    } else {
			        console.warn("Unexpected response:", data);
			        showStatus("Error saving customer.", false);
			    }
        })
		.catch(err => {
		        console.error("Fetch Error:", err);
		        showStatus("Connection failed.", false);
		    });
};

function showStatus(message, isSuccess) {
    const statusMsg = document.getElementById('statusMsg');
    statusMsg.innerText = message;
    statusMsg.style.color = isSuccess ? "#28a745" : "#CB3434"; 
    statusMsg.classList.remove('opacity-0');
    setTimeout(() => statusMsg.classList.add('opacity-0'), 3000);
}

// --- 3. ITEMS & BILLING LOGIC ---
window.createItemRow = (itemName) => {
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
        <td class="p-2 text-center"><button class="text-red-400" onclick="this.closest('tr').remove(); window.updateTotal();">✖</button></td>
    `;
    document.getElementById('itemList').appendChild(tr);
};
document.getElementById('addNewRowBtn').onclick = () => window.createItemRow("");

window.changeQty = (btn, val) => {
    const input = btn.parentElement.querySelector('.qty');
    
    let currentVal = parseInt(input.value) || 0;
    input.value = Math.max(0, currentVal + val);
    
    window.updateTotal();
};

window.updateTotal = () => {
    let total = 0;
    document.querySelectorAll('#itemList tr').forEach(row => {
        const q = parseInt(row.querySelector('.qty').value) || 0;
        const a = parseFloat(row.querySelector('.amt').value) || 0;
        total += q * a;
    });
    
    // 5. Update the text on the screen with Indian currency formatting
    const totalDisplay = document.getElementById('totalAmount');
    if (totalDisplay) {
        totalDisplay.innerText = total.toLocaleString('en-IN');
    }
};

window.loadDefaultItems = () => {
    const defaults = ["Normal Blouse(No lining)", "Normal Blouse(with lining)", "Normal chudi", "Design chudi", "Frock"];
    const tbody = document.getElementById('itemList');
    tbody.innerHTML = '';
    defaults.forEach(item => window.createItemRow(item));
};
window.showItemsPage = (name, phone, id = null) => {
    currentCustomerId = id; 
    enterDetailsDiv.classList.add('hidden');
    viewRecordDiv.classList.add('hidden');
    itemsPage.classList.remove('hidden');
    document.getElementById('displayItemName').innerText = name;
    document.getElementById('displayItemPhone').innerText = phone;
    document.getElementById('totalAmount').innerText = "0"; // Reset total
    loadDefaultItems();
};

document.getElementById('generateBill').onclick = () => {
    const name = document.getElementById('displayItemName').innerText;
    const phone = document.getElementById('displayItemPhone').innerText;
    const total = document.getElementById('totalAmount').innerText.replace(/,/g, '');
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
        params.append('total', total);
        params.append('items', JSON.stringify(items)); 

        fetch('saveBill', { method: 'POST', body: params })
        .then(res => {
			if (!res.ok) throw new Error("Bill save failed");
			        return res.text();
		})
        .then(data => {
            if (data === "Success") {
                showStatus("Bill Saved to Database!", true);
				nameInput.value = '';
				numberInput.value = '';
            }
        });
		
    }
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

// --- 4. EXPORT & SHARE & Download ---
window.downloadAsImage = () => {
    const bill = document.getElementById('billPrintArea');
    html2canvas(bill, { scale: 3 }).then(canvas => {
        const link = document.createElement('a');
        link.download = `Bill.png`;
        link.href = canvas.toDataURL();
        link.click();
    });
};

window.downloadAsPDF = () => {
    const { jsPDF } = window.jspdf;
    const bill = document.getElementById('billPrintArea');
    html2canvas(bill, { scale: 3 }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const width = pdf.internal.pageSize.getWidth();
        const height = (canvas.height * width) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, width, height);
        pdf.save("Bill.pdf");
    });
};
window.shareWhatsApp = () => {
    const name = document.getElementById('billCustName').innerText;
    const phone = document.getElementById('billCustPhone').innerText;
    const total = document.getElementById('billTotal').innerText;
    
    let message = `*DORCAS TAILORING SHOP*%0A`;
    message += `Customer: ${name}%0A`;
    message += `--------------------------%0A`;
    
    document.querySelectorAll('#billItemsBody tr').forEach(row => {
        const cols = row.querySelectorAll('td');
        if (cols.length >= 3) {
            message += `${cols[0].innerText} x ${cols[1].innerText} = ${cols[2].innerText}%0A`;
        }
    });

    message += `--------------------------%0A`;
    message += `*Total: ₹${total}*%0A`;
    message += `Thank you!`;

    const whatsappUrl = `https://wa.me/91${phone}?text=${message}`;
    window.open(whatsappUrl, '_blank');
};

// Initialize
fetchAndRenderCustomers();

// Delete the customer
window.deleteCustomer = (id) => {
    if (!confirm("Are you sure you want to delete this customer?")) return;

    const params = new URLSearchParams();
    params.append('id', id);

    fetch('deleteCustomer', { 
        method: 'POST', 
        body: params 
    })
    .then(res => {
        if (!res.ok) throw new Error('Delete failed on server');
        return res.text();
    })
    .then(data => {
        console.log("Delete response:", JSON.stringify(data));

        if (data.trim().toLowerCase() === "success") {
            customers = customers.filter(c => c.id !== id);
            fetchAndRenderCustomers();
            alert("Customer deleted.");
        } else {
            alert("Delete failed: " + data);
        }
    })
    .catch(err => {
        console.error("Error:", err);
        alert("Connection error while deleting.");
    });
};

window.closeBill = () => {
    const modal = document.getElementById('billModal');
    if (modal) {
        modal.classList.add('hidden');
    }
};
document.getElementById('backToView').onclick = () => {
    // Hide the items page
    document.getElementById('itemsPage').classList.add('hidden');
    // Show the main entry page
    document.getElementById('enter_details').classList.remove('hidden');
};
document.getElementById('itemEntry').onclick = () => {
    const name = nameInput.value.trim();
    const phone = numberInput.value.trim();

    if (!name || !phone) {
        alert("Please enter Customer Name and Phone Number first!");
        return;
    }

   
    window.showItemsPage(name, phone);
};
// search bar
document.getElementById('searchBar').addEventListener('input', function(e) {
    const term = e.target.value.toLowerCase().trim();
    const records = document.querySelectorAll('#recordList > div');
    let visibleCount = 0;

    records.forEach(card => {
        // We look for the name inside the customer card
        const name = card.querySelector('span.font-bold').innerText.toLowerCase();
        
        if (name.includes(term)) {
            card.style.display = 'flex';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });

    // Handle the "No Results" message
    let noResultMsg = document.getElementById('noResults');
    
    if (visibleCount === 0) {
        // If message doesn't exist yet, create it
        if (!noResultMsg) {
            noResultMsg = document.createElement('p');
            noResultMsg.id = 'noResults';
            noResultMsg.className = "text-center text-[#CB3434] py-10 font-medium";
            noResultMsg.innerText = "No customers match your search.";
            document.getElementById('recordList').appendChild(noResultMsg);
        }
    } else {
        // If we found results, remove the message if it exists
        if (noResultMsg) {
            noResultMsg.remove();
        }
    }
});
window.viewCustomerHistory = (customerId, customerName) => {
    fetch(`getHistory?customerId=${customerId}`)
        .then(res => {
            if (!res.ok) throw new Error("Failed to load history");
            return res.json();
        })
        .then(data => {
            document.getElementById('historyTitle').innerText =
                `Billing History – ${customerName}`;

            const tbody = document.getElementById('historyTableBody');
            tbody.innerHTML = '';

            if (!Array.isArray(data) || data.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="4" class="p-6 text-center opacity-60">
                            No bills found
                        </td>
                    </tr>`;
            } else {
                data.forEach(bill => {
                    let itemsText = '—';

                    // ✅ items_json may already be an array
                    if (Array.isArray(bill.items_json)) {
                        itemsText = bill.items_json
                            .map(i => `${i.name} (${i.qty})`)
                            .join(', ');
                    }

                    const tr = document.createElement('tr');
                    tr.className =
                        "border-b text-sm hover:bg-black/5 dark:hover:bg-white/5";

                    tr.innerHTML = `
                        <td class="p-3">${bill.bill_date}</td>
                        <td class="p-3 text-right font-bold">
                            ₹${bill.total_amount}
                        </td>
                        <td class="p-3 text-xs">${itemsText}</td>
                        <td class="p-3 text-center">
                            <button onclick="deleteBill(${bill.id})"
                              class="text-red-500 hover:text-red-700">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    `;

                    tbody.appendChild(tr);
                });
            }

            document.getElementById('historyModal')
                .classList.remove('hidden');
        })
        .catch(err => {
            console.error("History Fetch Error:", err);
            alert("Unable to load history");
        });
};

window.closeHistory = () => {
    document.getElementById('historyModal').classList.add('hidden');
};
const toggleBtn = document.getElementById('darkToggle');
const root = document.documentElement;

// Load saved preference
if (localStorage.getItem('darkMode') === 'on') {
    root.classList.add('dark');
    toggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
}

toggleBtn.onclick = () => {
    root.classList.toggle('dark');

    const isDark = root.classList.contains('dark');
    localStorage.setItem('darkMode', isDark ? 'on' : 'off');

    toggleBtn.innerHTML = isDark
        ? '<i class="fas fa-sun"></i>'
        : '<i class="fas fa-moon"></i>';
};

