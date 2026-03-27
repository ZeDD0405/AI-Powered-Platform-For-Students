import React from "react";
import "./Skeleton.css";

export function SkeletonBox({ width, height, borderRadius = "8px", style = {} }) {
  return (
    <div
      className="skel-box"
      style={{ width, height, borderRadius, ...style }}
    />
  );
}

export function SkeletonTestiCard() {
  return (
    <div className="skel-testi-card">
      <div className="skel-stars">
        {[...Array(5)].map((_, i) => (
          <SkeletonBox key={i} width={14} height={14} borderRadius="3px" />
        ))}
      </div>
      <SkeletonBox width="100%" height={12} style={{ marginBottom: 8 }} />
      <SkeletonBox width="88%"  height={12} style={{ marginBottom: 8 }} />
      <SkeletonBox width="72%"  height={12} style={{ marginBottom: 20 }} />
      <div className="skel-author">
        <SkeletonBox width={40} height={40} borderRadius="50%" style={{ flexShrink: 0 }} />
        <div className="skel-author-lines">
          <SkeletonBox width={110} height={12} style={{ marginBottom: 6 }} />
          <SkeletonBox width={75}  height={10} />
        </div>
      </div>
    </div>
  );
}
