import React from 'react';
import { Sparkles } from 'lucide-react';

const suvichar = {
  quote: `सेवा से बड़ा कोई धर्म नहीं होता,\nऔर गुरु की सेवा सबसे ऊँची सेवा है।`,
  author: '— श्री गुरुदेव',
  postedBy: 'Akash Singh',
};

const Suvichar = () => {
  return (
    <div className="max-w-xl mx-auto mt-6 p-4">
      <div className="bg-white border border-yellow-200 rounded-xl shadow-sm p-5">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="text-yellow-500 animate-pulse" />
          <h3 className="text-lg font-semibold text-yellow-700">आज का सुविचार</h3>
        </div>
        <p className="text-gray-800 text-base whitespace-pre-line font-serif leading-relaxed">
          “{suvichar.quote}”
        </p>
        <p className="mt-4 text-right text-sm italic text-yellow-600">{suvichar.author}</p>
        <p className="mt-1 text-right text-xs text-gray-500">Posted by: {suvichar.postedBy}</p>
      </div>
    </div>
  );
};

export default Suvichar;
