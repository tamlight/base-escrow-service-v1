'use client';

import { useState } from 'react';
import { 
  useAccount, 
  useWriteContract, 
  useReadContract, 
  useWaitForTransactionReceipt 
} from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { ConnectKitButton } from 'connectkit';
import { ShieldCheck, Plus, History, HelpCircle, Wallet, ArrowRight } from 'lucide-react';

const CONTRACT_ADDRESS = "0xD1da1A78e0645722deA52B3a58779045f310c8dE";
const ABI = [
  {
    "name": "nextEscrowId",
    "type": "function",
    "stateMutability": "view",
    "inputs": [],
    "outputs": [{"type": "uint256"}]
  },
  {
    "name": "getEscrow",
    "type": "function",
    "stateMutability": "view",
    "inputs": [{"type": "uint256", "name": "_id"}],
    "outputs": [
      {"type": "address", "name": "buyer"},
      {"type": "address", "name": "seller"},
      {"type": "uint256", "name": "amount"},
      {"type": "uint8", "name": "status"},
      {"type": "uint256", "name": "createdAt"}
    ]
  },
  {
    "name": "createEscrow",
    "type": "function",
    "stateMutability": "payable",
    "inputs": [{"type": "address", "name": "_seller"}],
    "outputs": [{"type": "uint256"}]
  },
  {
    "name": "confirmReceipt",
    "type": "function",
    "stateMutability": "nonpayable",
    "inputs": [{"type": "uint256", "name": "_id"}],
    "outputs": []
  },
  {
    "name": "refundSellerToBuyer",
    "type": "function",
    "stateMutability": "nonpayable",
    "inputs": [{"type": "uint256", "name": "_id"}],
    "outputs": []
  }
];

export default function Home() {
  const { isConnected, address } = useAccount();
  const [seller, setSeller] = useState('');
  const [amount, setAmount] = useState('');
  
  const { data: nextId } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: 'nextEscrowId',
    watch: true,
  });

  const { writeContract, data: hash } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash });

  const handleCreate = async () => {
    if (!seller || !amount) return;
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: ABI,
      functionName: 'createEscrow',
      args: [seller],
      value: parseEther(amount),
    });
  };

  return (
    <div className="flex h-screen bg-[#030712] text-gray-100 font-sans selection:bg-emerald-500/30">
      {/* Sidebar */}
      <aside className="w-64 bg-black/20 border-r border-white/5 p-8 flex flex-col backdrop-blur-xl">
        <div className="flex items-center gap-3 mb-12">
          <ShieldCheck className="text-emerald-500 w-8 h-8" />
          <span className="text-xl font-bold tracking-tight">BaseEscrow</span>
        </div>
        
        <nav className="space-y-2 flex-1">
          <NavItem icon={<History />} label="Transactions" active />
          <NavItem icon={<HelpCircle />} label="How it works" />
          <NavItem icon={<ShieldCheck />} label="Security" />
        </nav>

        <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Status</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm font-medium">Mainnet Online</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-12 py-10">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Escrow Dashboard</h1>
            <p className="text-gray-400 mt-1">Securely trade with anyone on Base.</p>
          </div>
          <ConnectKitButton />
        </header>

        {!isConnected ? (
          <div className="h-96 flex flex-col items-center justify-center bg-white/5 rounded-[32px] border border-dashed border-white/10">
            <Wallet className="w-12 h-12 text-gray-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Wallet Disconnected</h3>
            <p className="text-gray-500 mb-6 text-center max-w-xs">Connect your wallet to start creating or managing your escrows.</p>
            <ConnectKitButton />
          </div>
        ) : (
          <div className="grid grid-cols-12 gap-8">
            {/* Create Action */}
            <div className="col-span-4 space-y-8">
              <section className="bg-white/5 p-8 rounded-[32px] border border-white/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Plus className="w-24 h-24 text-emerald-500" />
                </div>
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-emerald-500" /> New Escrow
                </h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Seller Address</label>
                    <input 
                      type="text" 
                      placeholder="0x..." 
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500/50 transition-colors text-sm"
                      value={seller}
                      onChange={(e) => setSeller(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Deposit Amount (ETH)</label>
                    <input 
                      type="number" 
                      placeholder="0.00" 
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500/50 transition-colors text-sm"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>
                  <button 
                    onClick={handleCreate}
                    disabled={isConfirming}
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-4 rounded-xl transition-all shadow-lg shadow-emerald-500/10 active:scale-[0.98] disabled:opacity-50"
                  >
                    {isConfirming ? 'Processing...' : 'Create Escrow'}
                  </button>
                </div>
              </section>

              <section className="bg-white/5 p-6 rounded-[24px] border border-white/5">
                <h4 className="text-sm font-bold text-gray-400 mb-4 uppercase tracking-widest">Network Stats</h4>
                <div className="space-y-4">
                  <StatItem label="Contract" value={CONTRACT_ADDRESS.slice(0,6)+'...'} />
                  <StatItem label="Total Escrows" value={nextId?.toString() || '0'} />
                </div>
              </section>
            </div>

            {/* List Table */}
            <div className="col-span-8">
              <div className="bg-white/5 rounded-[32px] border border-white/5 overflow-hidden">
                <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                  <h3 className="font-bold">Recent Activity</h3>
                  <button className="text-sm text-emerald-500 font-bold hover:underline">View All</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                        <th className="px-8 py-4">ID</th>
                        <th className="px-4 py-4">Seller</th>
                        <th className="px-4 py-4">Amount</th>
                        <th className="px-4 py-4">Status</th>
                        <th className="px-8 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm text-gray-300">
                      {[...Array(Number(nextId || 0))].map((_, i) => (
                        <EscrowRow key={i} id={Number(nextId) - 1 - i} contractAddress={CONTRACT_ADDRESS} userAddress={address} />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function NavItem({ icon, label, active = false }) {
  return (
    <a href="#" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${active ? 'bg-white/5 text-emerald-500 ring-1 ring-white/10' : 'text-gray-400 hover:text-white hover:bg-white/[0.02]'}`}>
      {icon}
      <span className="font-semibold text-sm">{label}</span>
    </a>
  );
}

function StatItem({ label, value }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-xs text-gray-500">{label}</span>
      <span className="text-xs font-mono font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-md">{value}</span>
    </div>
  );
}

function EscrowRow({ id, contractAddress, userAddress }) {
  const { data: escrow } = useReadContract({
    address: contractAddress,
    abi: ABI,
    functionName: 'getEscrow',
    args: [BigInt(id)],
  });

  const { writeContract } = useWriteContract();

  if (!escrow) return null;

  const [buyer, seller, amount, status] = escrow;
  const statusLabels = ["OPEN", "COMPLETED", "REFUNDED"];
  const statusColors = ["text-blue-400 bg-blue-400/10", "text-emerald-400 bg-emerald-400/10", "text-red-400 bg-red-400/10"];

  return (
    <tr className="hover:bg-white/[0.02] transition-colors border-b border-white/5 last:border-0">
      <td className="px-8 py-4 font-mono text-xs">#{id}</td>
      <td className="px-4 py-4 text-xs font-mono">{seller.slice(0,6)}...{seller.slice(-4)}</td>
      <td className="px-4 py-4 font-bold">{formatEther(amount)} ETH</td>
      <td className="px-4 py-4">
        <span className={`px-2 py-1 rounded text-[10px] font-bold ${statusColors[status]}`}>
          {statusLabels[status]}
        </span>
      </td>
      <td className="px-8 py-4 text-right">
        {status === 0 && (
          <div className="flex justify-end gap-2">
            {buyer.toLowerCase() === userAddress?.toLowerCase() && (
              <button 
                onClick={() => writeContract({ address: contractAddress, abi: ABI, functionName: 'confirmReceipt', args: [BigInt(id)] })}
                className="px-3 py-1 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-black rounded-lg text-xs font-bold transition-all"
              >
                Release
              </button>
            )}
            {seller.toLowerCase() === userAddress?.toLowerCase() && (
              <button 
                onClick={() => writeContract({ address: contractAddress, abi: ABI, functionName: 'refundSellerToBuyer', args: [BigInt(id)] })}
                className="px-3 py-1 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-lg text-xs font-bold transition-all"
              >
                Refund
              </button>
            )}
          </div>
        )}
      </td>
    </tr>
  );
}
