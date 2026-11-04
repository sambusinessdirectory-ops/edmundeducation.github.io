(function exposeVideoClassZip(globalScope) {
  "use strict";

  const encoder = new TextEncoder();
  let crcTable;

  function crc32Update(crc, bytes) {
    if (!crcTable) {
      crcTable = new Uint32Array(256);
      for (let index = 0; index < 256; index += 1) {
        let value = index;
        for (let bit = 0; bit < 8; bit += 1) {
          value = (value >>> 1) ^ ((value & 1) ? 0xedb88320 : 0);
        }
        crcTable[index] = value >>> 0;
      }
    }
    let value = crc >>> 0;
    for (let index = 0; index < bytes.length; index += 1) {
      value = crcTable[(value ^ bytes[index]) & 0xff] ^ (value >>> 8);
    }
    return value >>> 0;
  }

  function bytes(length, write) {
    const value = new Uint8Array(length);
    write(new DataView(value.buffer));
    return value;
  }

  function setUint64(view, offset, value) {
    const number = BigInt(value);
    view.setUint32(offset, Number(number & 0xffffffffn), true);
    view.setUint32(offset + 4, Number((number >> 32n) & 0xffffffffn), true);
  }

  function dosTimestamp(value) {
    const parsed = value ? new Date(value) : new Date();
    const date = Number.isNaN(parsed.getTime()) ? new Date() : parsed;
    const year = Math.min(2107, Math.max(1980, date.getUTCFullYear()));
    return {
      time: (date.getUTCHours() << 11) | (date.getUTCMinutes() << 5) | Math.floor(date.getUTCSeconds() / 2),
      date: ((year - 1980) << 9) | ((date.getUTCMonth() + 1) << 5) | date.getUTCDate()
    };
  }

  function safeName(value) {
    return String(value || "video.mp4").normalize("NFKC")
      .replace(/[\\/\u0000-\u001f\u007f]/g, "-")
      .replace(/\s+/g, " ").trim().slice(0, 180) || "video.mp4";
  }

  function archiveName(entry, index) {
    const source = String(entry?.name || entry?.key || "");
    const base = safeName(source.split("/").pop() || `video-${index + 1}.mp4`);
    return `${String(index + 1).padStart(5, "0")}-${base}`;
  }

  async function writeArchive(writable, entries, openEntry, onProgress) {
    if (!writable || typeof writable.write !== "function" || typeof writable.close !== "function") {
      throw new TypeError("A writable file stream is required");
    }
    if (!Array.isArray(entries) || !entries.length || typeof openEntry !== "function") {
      throw new TypeError("At least one archive entry is required");
    }

    const centralEntries = [];
    let offset = 0n;
    let completedBytes = 0;
    const expectedTotal = entries.reduce((sum, entry) => sum + Math.max(0, Number(entry?.size) || 0), 0);
    const write = async value => {
      await writable.write(value);
      offset += BigInt(value.byteLength);
    };

    try {
      for (let index = 0; index < entries.length; index += 1) {
        const entry = entries[index];
        const nameBytes = encoder.encode(archiveName(entry, index));
        const timestamp = dosTimestamp(entry?.uploaded);
        const localOffset = offset;
        const localExtra = bytes(20, view => {
          view.setUint16(0, 0x0001, true);
          view.setUint16(2, 16, true);
          setUint64(view, 4, 0n);
          setUint64(view, 12, 0n);
        });
        const localHeader = bytes(30, view => {
          view.setUint32(0, 0x04034b50, true);
          view.setUint16(4, 45, true);
          view.setUint16(6, 0x0808, true);
          view.setUint16(8, 0, true);
          view.setUint16(10, timestamp.time, true);
          view.setUint16(12, timestamp.date, true);
          view.setUint32(14, 0, true);
          view.setUint32(18, 0xffffffff, true);
          view.setUint32(22, 0xffffffff, true);
          view.setUint16(26, nameBytes.length, true);
          view.setUint16(28, localExtra.length, true);
        });
        await write(localHeader);
        await write(nameBytes);
        await write(localExtra);

        const body = await openEntry(entry, index);
        if (!body || typeof body.getReader !== "function") throw new Error("Video download stream is unavailable");
        const reader = body.getReader();
        let crc = 0xffffffff;
        let size = 0n;
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = value instanceof Uint8Array ? value : new Uint8Array(value);
          crc = crc32Update(crc, chunk);
          size += BigInt(chunk.byteLength);
          completedBytes += chunk.byteLength;
          await write(chunk);
          onProgress?.({ entry, index, completedBytes, expectedTotal });
        }
        if (Number.isSafeInteger(Number(entry?.size)) && Number(entry.size) > 0 && size !== BigInt(entry.size)) {
          throw new Error("Video size changed during backup; please retry this part");
        }
        crc = (crc ^ 0xffffffff) >>> 0;
        await write(bytes(24, view => {
          view.setUint32(0, 0x08074b50, true);
          view.setUint32(4, crc, true);
          setUint64(view, 8, size);
          setUint64(view, 16, size);
        }));
        centralEntries.push({ nameBytes, timestamp, crc, size, localOffset });
      }

      const centralOffset = offset;
      for (const entry of centralEntries) {
        const header = bytes(46, view => {
          view.setUint32(0, 0x02014b50, true);
          view.setUint16(4, 45, true);
          view.setUint16(6, 45, true);
          view.setUint16(8, 0x0808, true);
          view.setUint16(10, 0, true);
          view.setUint16(12, entry.timestamp.time, true);
          view.setUint16(14, entry.timestamp.date, true);
          view.setUint32(16, entry.crc, true);
          view.setUint32(20, 0xffffffff, true);
          view.setUint32(24, 0xffffffff, true);
          view.setUint16(28, entry.nameBytes.length, true);
          view.setUint16(30, 28, true);
          view.setUint16(32, 0, true);
          view.setUint16(34, 0, true);
          view.setUint16(36, 0, true);
          view.setUint32(38, 0, true);
          view.setUint32(42, 0xffffffff, true);
        });
        const extra = bytes(28, view => {
          view.setUint16(0, 0x0001, true);
          view.setUint16(2, 24, true);
          setUint64(view, 4, entry.size);
          setUint64(view, 12, entry.size);
          setUint64(view, 20, entry.localOffset);
        });
        await write(header);
        await write(entry.nameBytes);
        await write(extra);
      }

      const centralSize = offset - centralOffset;
      const zip64Offset = offset;
      await write(bytes(56, view => {
        view.setUint32(0, 0x06064b50, true);
        setUint64(view, 4, 44n);
        view.setUint16(12, 45, true);
        view.setUint16(14, 45, true);
        view.setUint32(16, 0, true);
        view.setUint32(20, 0, true);
        setUint64(view, 24, BigInt(centralEntries.length));
        setUint64(view, 32, BigInt(centralEntries.length));
        setUint64(view, 40, centralSize);
        setUint64(view, 48, centralOffset);
      }));
      await write(bytes(20, view => {
        view.setUint32(0, 0x07064b50, true);
        view.setUint32(4, 0, true);
        setUint64(view, 8, zip64Offset);
        view.setUint32(16, 1, true);
      }));
      await write(bytes(22, view => {
        view.setUint32(0, 0x06054b50, true);
        view.setUint16(4, 0, true);
        view.setUint16(6, 0, true);
        view.setUint16(8, Math.min(0xffff, centralEntries.length), true);
        view.setUint16(10, Math.min(0xffff, centralEntries.length), true);
        view.setUint32(12, centralSize > 0xffffffffn ? 0xffffffff : Number(centralSize), true);
        view.setUint32(16, centralOffset > 0xffffffffn ? 0xffffffff : Number(centralOffset), true);
        view.setUint16(20, 0, true);
      }));
      await writable.close();
      return { entryCount: entries.length, sourceBytes: completedBytes };
    } catch (error) {
      try { await writable.abort?.(error); } catch { /* The partial local file may already have been discarded. */ }
      throw error;
    }
  }

  async function createArchiveStream(entries, openEntry, onProgress) {
    const stream = new TransformStream();
    const completion = writeArchive(stream.writable.getWriter(), entries, openEntry, onProgress);
    return { readable: stream.readable, completion };
  }

  const api = Object.freeze({ archiveName, crc32Update, createArchiveStream, writeArchive });
  globalScope.VideoClassZip = api;
  if (typeof module === "object" && module?.exports) module.exports = api;
})(typeof globalThis === "object" ? globalThis : window);
