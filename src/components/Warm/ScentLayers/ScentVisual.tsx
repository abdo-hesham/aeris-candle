import Image from "next/image";
import { scentLayers, scents } from "./scentData";

const objectSize = { width: 1448, height: 1086 };
const squareSize = { width: 1254, height: 1254 };
const sceneSize = { width: 1672, height: 941 };

export default function ScentVisual() {
  return (
    <div className="scent-visual" aria-hidden="true">
      <div className="scent-layer scent-layer--background">
        <Image
          src={scentLayers.background}
          alt=""
          {...sceneSize}
          sizes="100vw"
          quality={85}
          loading="eager"
          fetchPriority="low"
        />
      </div>
      {/* Two stages hold one aspect ratio of their own, so the objects keep
          their relationship to each other on any viewport. The daylight
          overlay sits between them: leaves fall on the wall and the stone
          disc, never on the ingredients in front. */}
      <div className="scent-stage">
        <div className="scent-layer scent-layer--disc">
          <Image
            src={scentLayers.disc}
            alt=""
            {...squareSize}
            sizes="(max-width: 767px) 90vw, 60vw"
            quality={85}
            loading="eager"
            fetchPriority="low"
          />
        </div>
      </div>
      <div className="scent-layer scent-layer--shadow">
        <Image
          src={scentLayers.shadow}
          alt=""
          {...sceneSize}
          sizes="100vw"
          quality={75}
          loading="eager"
          fetchPriority="low"
        />
      </div>
      <div className="scent-stage">
        <div className="scent-layer scent-layer--platform">
          <Image
            src={scentLayers.platform}
            alt=""
            {...objectSize}
            sizes="(max-width: 767px) 96vw, 56vw"
            quality={85}
            loading="eager"
            fetchPriority="low"
          />
        </div>
        <div className="scent-layer scent-layer--bowl">
          <Image
            src={scentLayers.bowl}
            alt=""
            {...squareSize}
            sizes="(max-width: 767px) 34vw, 18vw"
            quality={85}
            loading="eager"
            fetchPriority="low"
          />
        </div>
        <div className="scent-layer scent-layer--ingredient">
          {scents.map((scent, index) => (
            <div
              key={scent.key}
              className="scent-ingredient"
              data-scent-ingredient={index}
            >
              <Image
                src={scent.image}
                alt=""
                {...objectSize}
                sizes="(max-width: 767px) 78vw, 38vw"
                quality={85}
                loading="eager"
                fetchPriority="low"
              />
            </div>
          ))}
        </div>
        <div className="scent-layer scent-layer--branch">
          <Image
            src={scentLayers.branch}
            alt=""
            {...objectSize}
            sizes="(max-width: 767px) 62vw, 32vw"
            quality={85}
            loading="eager"
            fetchPriority="low"
          />
        </div>
      </div>
      <div className="scent-tone scent-tone--warm" data-scent-tone="warm" />
      <div
        className="scent-tone scent-tone--grounded"
        data-scent-tone="grounded"
      />
    </div>
  );
}
