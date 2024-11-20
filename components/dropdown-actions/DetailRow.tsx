const DetailRow = ({ label, value }: { label: string; value: string }) => (
    <div className="flex">
      <p className="file-details-label text-left">{label}</p>
      <p className="file-details-value text-left">{value}</p>
    </div>
  );
  export default DetailRow;