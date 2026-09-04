import type { ResourceItem } from "@/lib/resources";
import PhosphorIcon from "./PhosphorIcon";

export default function ResourceGrid({ resources }: { resources: ResourceItem[] }) {
  return (
    <div className="resource-grid">
      {resources.map((resource) => (
        <a
          key={resource.id}
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="resource-card"
        >
          <div className="resource-card-heading">
            <h3>
              {resource.title}
              {resource.certificate && (
                <span className="resource-certificate" aria-label="Incluye certificado">
                  <PhosphorIcon name="Certificate" size={18} weight="duotone" aria-hidden="true" />
                </span>
              )}
            </h3>
            <PhosphorIcon name="ArrowUpRight" size={17} aria-hidden="true" />
          </div>
          <p>{resource.description}</p>
          <div className="resource-meta" aria-label="Datos del recurso">
            <span>{resource.kind}</span>
            <span>{resource.level}</span>
            <span>{resource.language}</span>
          </div>
        </a>
      ))}
    </div>
  );
}
