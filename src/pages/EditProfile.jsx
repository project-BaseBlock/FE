// src/pages/EditProfile.jsx
import React, { useEffect, useState } from "react";
import { userApi } from "../api/userApi";

const isEthAddress = (v) => /^0x[a-fA-F0-9]{40}$/.test(v);

export default function EditProfile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [email, setEmail] = useState("-");
  const [nickname, setNickname] = useState("");
  const [walletAddress, setWalletAddress] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const me = await userApi.getMe(); // 없으면 null
        if (me) {
          setEmail(me.email ?? "-");
          setNickname(me.nickname ?? "");
          setWalletAddress(me.walletAddress ?? "");
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function onSaveNickname(e) {
    e.preventDefault();
    if (!nickname || nickname.length < 2 || nickname.length > 20) {
      alert("닉네임은 2~20자 사이여야 합니다.");
      return;
    }
    setSaving(true);
    try {
      await userApi.updateNickname(nickname);
      alert("닉네임이 저장되었습니다.");
    } catch (e) {
      console.error(e);
      alert("닉네임 저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  }

  async function onSaveWallet(e) {
    e.preventDefault();
    if (walletAddress && !isEthAddress(walletAddress)) {
      alert("지갑 주소 형식이 올바르지 않습니다. (0x + 40자리 16진수)");
      return;
    }
    setSaving(true);
    try {
      await userApi.upsertWallet(walletAddress);
      alert("지갑 주소가 저장되었습니다.");
    } catch (e) {
      console.error(e);
      alert("지갑 주소 저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div style={{ padding: 16 }}>로딩 중…</div>;

  return (
    <div style={{ maxWidth: 640, padding: 16 }}>
      <h2 style={{ marginBottom: 16 }}>정보 수정</h2>

      <section style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 14, color: "#666" }}>이메일</div>
        <div style={{ fontWeight: 600 }}>{email}</div>
      </section>

      <form onSubmit={onSaveNickname} style={{ marginBottom: 24 }}>
        <label style={{ display: "block", marginBottom: 8 }}>닉네임</label>
        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="닉네임 (2~20자)"
          maxLength={20}
          style={{ width: "100%", padding: 10, border: "1px solid #ddd", borderRadius: 8 }}
        />
        <button
          type="submit"
          disabled={saving}
          style={{ marginTop: 12, padding: "10px 16px", borderRadius: 8 }}
        >
          {saving ? "저장 중…" : "닉네임 저장"}
        </button>
      </form>

      <form onSubmit={onSaveWallet}>
        <label style={{ display: "block", marginBottom: 8 }}>지갑 주소</label>
        <input
          type="text"
          value={walletAddress}
          onChange={(e) => setWalletAddress(e.target.value.trim())}
          placeholder="0x로 시작하는 42자 주소 (선택)"
          style={{ width: "100%", padding: 10, border: "1px solid #ddd", borderRadius: 8 }}
        />
        <div style={{ fontSize: 12, color: "#777", marginTop: 6 }}>
          * 비워두면 나중에 클레임 시점에 등록해도 됩니다.
        </div>
        <button
          type="submit"
          disabled={saving}
          style={{ marginTop: 12, padding: "10px 16px", borderRadius: 8 }}
        >
          {saving ? "저장 중…" : "지갑 주소 저장"}
        </button>
      </form>
    </div>
  );
}
