<!DOCTYPE html>
<html>
<head>
    <title>Stock Inventory Report</title>
</head>
<body style="font-family: sans-serif;">
    <h2>Current Diamond Stock Report</h2>
    <p>Attached is the latest inventory snapshot.</p>
    
    <table border="1" style="border-collapse: collapse; width: 100%;">
        <thead>
            <tr style="background: #f3f4f6;">
                <th>Lot Name</th>
                <th>Supplier</th>
                <th>Carats</th>
                <th>Cost/ct</th>
                <th>Valuation</th>
            </tr>
        </thead>
        <tbody>
            @foreach($stocks as $s)
            <tr>
                <td>{{ $s->lot_name }}</td>
                <td>{{ $s->purchaseItem->purchase->supplier->name ?? 'N/A' }}</td>
                <td>{{ $s->remaining_carat }}ct</td>
                <td>${{ $s->cost_rate }}</td>
                <td>${{ $s->remaining_carat * $s->cost_rate }}</td>
            </tr>
            @endforeach
        </tbody>
        <tfoot>
            <tr style="font-weight: bold;">
                <td colspan="4">Total Valuation</td>
                <td>${{ $stocks->sum(fn($s) => $s->remaining_carat * $s->cost_rate) }}</td>
            </tr>
        </tfoot>
    </table>
</body>
</html>
